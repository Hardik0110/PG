/* eslint-disable react-refresh/only-export-components -- co-locating hook with provider for cohesion */
import { createContext, useContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { DataPort } from './port';
import { httpAdapter } from './httpAdapter';

const DataPortContext = createContext<DataPort | null>(null);

export function DataProvider({
  port,
  client,
  children,
}: {
  port?: DataPort;
  client?: QueryClient;
  children: React.ReactNode;
}) {
  const portValue = useMemo(() => port ?? httpAdapter, [port]);
  const [queryClient] = useState(
    () =>
      client ??
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <DataPortContext.Provider value={portValue}>{children}</DataPortContext.Provider>
    </QueryClientProvider>
  );
}

export function useDataPort(): DataPort {
  const port = useContext(DataPortContext);
  if (!port) throw new Error('useDataPort must be used within DataProvider');
  return port;
}
