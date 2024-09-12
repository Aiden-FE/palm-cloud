'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { type StoreApi, useStore } from 'zustand';
import { type ContextStore, createContextStore, createDefaultContextState } from '@/stores/context';

export const ContextStoreContext = createContext<StoreApi<ContextStore> | null>(null);

export interface ContextStoreProviderProps {
  children: ReactNode;
}

export const ContextStoreProvider = ({ children }: ContextStoreProviderProps) => {
  const storeRef = useRef<StoreApi<ContextStore>>();
  if (!storeRef.current) {
    storeRef.current = createContextStore(createDefaultContextState());
  }

  return <ContextStoreContext.Provider value={storeRef.current}>{children}</ContextStoreContext.Provider>;
};

export const useContextStore = <T = ContextStore,>(selector: (store: ContextStore) => T): T => {
  const contextStoreContext = useContext(ContextStoreContext);

  if (!contextStoreContext) {
    throw new Error('useContextStore must be use within ContextStoreProvider');
  }

  return useStore(contextStoreContext, selector);
};
