/* eslint-disable react-refresh/only-export-components -- co-locating hook with provider for cohesion */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ToastProvider, useToast } from './ui/Toast';
import ConfirmModal from './ui/ConfirmModal';

type ToastType = 'success' | 'error' | 'warning';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

interface ToastApi {
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
}

interface Feedback {
  toast: ToastApi;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  error: <T>(
    work: Promise<T> | (() => Promise<T>),
    fallbackMessage: string,
    successMessage?: string,
  ) => Promise<T | undefined>;
}

const FeedbackContext = createContext<Feedback | null>(null);

interface ConfirmRequest extends ConfirmOptions {
  id: number;
  resolve: (ok: boolean) => void;
}

let confirmIdCounter = 0;
const RECENT_TOAST_TTL_MS = 1000;

function FeedbackInner({ children }: { children: React.ReactNode }) {
  const { toast: rawToast } = useToast();
  const [queue, setQueue] = useState<ConfirmRequest[]>([]);
  const lastToast = useRef<{ key: string; ts: number }>({ key: '', ts: 0 });

  const toast = useMemo<ToastApi>(() => {
    const post = (type: ToastType) => (message: string) => {
      const key = `${type}:${message}`;
      const now = Date.now();
      if (lastToast.current.key === key && now - lastToast.current.ts < RECENT_TOAST_TTL_MS) {
        lastToast.current.ts = now;
        return;
      }
      lastToast.current = { key, ts: now };
      rawToast({ type, message });
    };
    return { success: post('success'), error: post('error'), warning: post('warning') };
  }, [rawToast]);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        const id = ++confirmIdCounter;
        setQueue((q) => [...q, { ...opts, id, resolve }]);
      }),
    [],
  );

  const error = useCallback(
    async <T,>(
      work: Promise<T> | (() => Promise<T>),
      fallbackMessage: string,
      successMessage?: string,
    ): Promise<T | undefined> => {
      try {
        const promise = typeof work === 'function' ? (work as () => Promise<T>)() : work;
        const result = await promise;
        if (successMessage) toast.success(successMessage);
        return result;
      } catch (err) {
        const msg =
          (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
            ? err.message
            : null) || fallbackMessage;
        toast.error(msg);
        if (import.meta.env.DEV) console.error('[feedback.error]', err);
        return undefined;
      }
    },
    [toast],
  );

  const api = useMemo<Feedback>(() => ({ toast, confirm, error }), [toast, confirm, error]);

  const top = queue[0];
  const closeTop = (ok: boolean) => {
    if (!top) return;
    top.resolve(ok);
    setQueue((q) => q.slice(1));
  };

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      <ConfirmModal
        open={!!top}
        onClose={() => closeTop(false)}
        onConfirm={() => closeTop(true)}
        title={top?.title ?? ''}
        message={top?.message ?? ''}
        confirmLabel={top?.confirmLabel ?? 'Confirm'}
        variant={top?.variant ?? 'danger'}
      />
    </FeedbackContext.Provider>
  );
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <FeedbackInner>{children}</FeedbackInner>
    </ToastProvider>
  );
}

export function useFeedback(): Feedback {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider');
  return ctx;
}
