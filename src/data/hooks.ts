import { useMemo } from 'react';
import {
  useQuery,
  useQueries,
  useMutation as useRqMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Resource, ListParams } from './port';
import { useDataPort } from './DataProvider';

export const queryKeys = {
  list: (resource: Resource, params?: ListParams) =>
    params && Object.keys(params).length > 0
      ? ([resource, 'list', params] as const)
      : ([resource, 'list'] as const),
  item: (resource: Resource, id: string) => [resource, 'item', id] as const,
  resource: (resource: Resource) => [resource] as const,
};

interface ResourceOptions {
  pgId?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseResourceOptions extends ResourceOptions {
  joinPg?: boolean;
}

interface ResourceResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useResource<T extends { pg_id?: string } = any>(
  resource: Resource,
  options: UseResourceOptions = {},
): ResourceResult<T & { pgName?: string }> {
  const port = useDataPort();
  const { pgId, enabled = true, refetchInterval, joinPg = true } = options;
  const params = useMemo(() => (pgId ? { pgId } : undefined), [pgId]);
  const shouldJoin = joinPg && resource !== 'pgs';

  const listQuery = useQuery({
    queryKey: queryKeys.list(resource, params),
    queryFn: () => port.list<T>(resource, params),
    enabled,
    refetchInterval,
  });

  const pgsQuery = useQuery({
    queryKey: queryKeys.list('pgs'),
    queryFn: () => port.list<{ id: string; name: string }>('pgs'),
    enabled: enabled && shouldJoin,
  });

  const joined = useMemo(() => {
    const list = listQuery.data ?? [];
    if (!shouldJoin) return list as (T & { pgName?: string })[];
    const pgById = new Map((pgsQuery.data ?? []).map((p) => [p.id, p]));
    return list.map((row) => ({
      ...row,
      pgName: row.pg_id ? pgById.get(row.pg_id)?.name : undefined,
    })) as (T & { pgName?: string })[];
  }, [listQuery.data, pgsQuery.data, shouldJoin]);

  return {
    data: joined,
    loading: listQuery.isLoading || (shouldJoin && pgsQuery.isLoading),
    error: (listQuery.error as Error | null) ?? (pgsQuery.error as Error | null),
    refetch: async () => {
      await Promise.all([listQuery.refetch(), pgsQuery.refetch()]);
    },
  };
}

interface UseAggregateResult<R extends readonly Resource[]> {
  data: { [K in R[number]]: any[] };
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAggregate<R extends readonly Resource[]>(
  resources: R,
): UseAggregateResult<R> {
  const port = useDataPort();

  const pgsQuery = useQuery({
    queryKey: queryKeys.list('pgs'),
    queryFn: () => port.list<{ id: string }>('pgs'),
  });
  const pgIds = (pgsQuery.data ?? []).map((p) => p.id);

  const flatResources = resources.filter((r) => r !== 'tickets' && r !== 'pgs');
  const flatQueries = useQueries({
    queries: flatResources.map((resource) => ({
      queryKey: queryKeys.list(resource),
      queryFn: () => port.list(resource),
    })),
  });

  const ticketQueries = useQueries({
    queries: pgIds.map((pgId) => ({
      queryKey: queryKeys.list('tickets', { pgId }),
      queryFn: () => port.list('tickets', { pgId }),
      enabled: resources.includes('tickets'),
    })),
  });

  const data = useMemo(() => {
    const out: Record<string, any[]> = {};
    for (const resource of resources) {
      if (resource === 'pgs') {
        out[resource] = pgsQuery.data ?? [];
      } else if (resource === 'tickets') {
        out[resource] = ticketQueries.flatMap((q) => q.data ?? []);
      } else {
        const idx = flatResources.indexOf(resource);
        out[resource] = (flatQueries[idx]?.data as any[]) ?? [];
      }
    }
    return out as { [K in R[number]]: any[] };
  }, [resources, pgsQuery.data, ticketQueries, flatQueries, flatResources]);

  const loading =
    pgsQuery.isLoading ||
    flatQueries.some((q) => q.isLoading) ||
    ticketQueries.some((q) => q.isLoading);

  const error =
    (pgsQuery.error as Error | null) ??
    (flatQueries.find((q) => q.error)?.error as Error | null) ??
    (ticketQueries.find((q) => q.error)?.error as Error | null) ??
    null;

  return {
    data,
    loading,
    error,
    refetch: async () => {
      await Promise.all([
        pgsQuery.refetch(),
        ...flatQueries.map((q) => q.refetch()),
        ...ticketQueries.map((q) => q.refetch()),
      ]);
    },
  };
}

export interface Repo {
  list: <T = any>(params?: ListParams) => Promise<T[]>;
  create: <T = any>(body: unknown) => Promise<T>;
  update: <T = any>(id: string, patch: unknown) => Promise<T>;
  remove: (id: string) => Promise<void>;
  invalidate: () => void;
}

export function useRepo(resource: Resource): Repo {
  const port = useDataPort();
  const queryClient = useQueryClient();
  return useMemo<Repo>(
    () => ({
      list: <T>(params) => port.list<T>(resource, params),
      create: async <T>(body) => {
        const created = await port.create<T>(resource, body);
        queryClient.invalidateQueries({ queryKey: queryKeys.resource(resource) });
        return created;
      },
      update: async <T>(id, patch) => {
        const updated = await port.update<T>(resource, id, patch);
        queryClient.invalidateQueries({ queryKey: queryKeys.resource(resource) });
        return updated;
      },
      remove: async (id) => {
        await port.remove(resource, id);
        queryClient.invalidateQueries({ queryKey: queryKeys.resource(resource) });
      },
      invalidate: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.resource(resource) });
      },
    }),
    [port, resource, queryClient],
  );
}

export function useMutation<TInput, TOutput = unknown>(
  fn: (input: TInput) => Promise<TOutput>,
): {
  mutate: (input: TInput) => Promise<TOutput | undefined>;
  isPending: boolean;
  error: Error | null;
} {
  const m = useRqMutation({ mutationFn: fn });
  return {
    mutate: async (input) => {
      try {
        return await m.mutateAsync(input);
      } catch {
        return undefined;
      }
    },
    isPending: m.isPending,
    error: (m.error as Error | null) ?? null,
  };
}
