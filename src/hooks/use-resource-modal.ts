import { useCallback, useState } from 'react';

export type ModalMode = 'add' | 'edit';

export interface ResourceModalState<T> {
  open: boolean;
  mode: ModalMode;
  initial: T | null;
}

export interface ResourceModalApi<T> {
  state: ResourceModalState<T>;
  modalProps: {
    open: boolean;
    mode: ModalMode;
    initial: T | null;
    onClose: () => void;
  };
  openAdd: () => void;
  openEdit: (item: T) => void;
  close: () => void;
}

export function useResourceModal<T>(): ResourceModalApi<T> {
  const [state, setState] = useState<ResourceModalState<T>>({
    open: false,
    mode: 'add',
    initial: null,
  });

  const openAdd = useCallback(() => {
    setState({ open: true, mode: 'add', initial: null });
  }, []);

  const openEdit = useCallback((item: T) => {
    setState({ open: true, mode: 'edit', initial: item });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  return {
    state,
    modalProps: {
      open: state.open,
      mode: state.mode,
      initial: state.initial,
      onClose: close,
    },
    openAdd,
    openEdit,
    close,
  };
}
