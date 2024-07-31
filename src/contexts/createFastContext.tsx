/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Draft, create } from 'mutative';
import React, { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

export type StoreOption = {
  addOnlyIfAbsent?: boolean;
};

const objetWithoutUndefinedValues = <TObj extends Record<string, unknown>>(objet: TObj) =>
  (Object.entries(objet) as [keyof TObj, TObj[keyof TObj]][]).reduce((acc, [key, val]) => {
    if (val !== undefined) {
      acc[key] = val;
    }
    return acc;
  }, {} as Partial<TObj>);

export type Updater<Store> = Partial<Store> | ((currentStore: Draft<Store>) => void);

export default function createFastContext<Store extends Record<string, unknown>>() {
  const useStoreData = (
    initialState: Store,
  ): {
    get: () => Store;
    clear: (value?: string | string[]) => void;
    set: (value: Updater<Store>, option?: StoreOption) => void;
    subscribe: (callback: () => void) => () => void;
  } => {
    const store = useRef(structuredClone(initialState));

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const set = useCallback((value: Updater<Store>, option?: StoreOption) => {
      if (typeof value === 'function') {
        store.current = create(
          store.current,
          (draft) => {
            value(draft);
          },
          { strict: true },
        );
      } else if (option?.addOnlyIfAbsent) {
        store.current = { ...value, ...objetWithoutUndefinedValues(store.current) } as Store;
      } else {
        const base: Partial<Store> = {};
        const valueKeys = Object.keys(value);
        (Object.keys(store.current) as (keyof Store)[]).forEach((key) => {
          if (!valueKeys.includes(key as string)) {
            base[key] = store.current[key];
          }
        });
        const merged = Object.assign(base, value);
        store.current = merged as Store;
      }
      subscribers.current.forEach((callback) => callback());
    }, []);

    const clear = useCallback((value?: string | string[]) => {
      if (Array.isArray(value)) {
        value.forEach((key) => {
          store.current = { ...store.current, [key]: undefined };
        });
      } else if (value) {
        store.current = { ...store.current, [value]: undefined };
      } else {
        store.current = {} as Store;
      }
      subscribers.current.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      clear,
      subscribe,
    };
  };

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType | null>(null);

  function Provider({ initialState, children }: { initialState: Store; children: React.ReactNode }) {
    return <StoreContext.Provider value={useStoreData(initialState)}>{children}</StoreContext.Provider>;
  }

  function useStore<SelectorOutput>(selector: (store: Store) => SelectorOutput): SelectorOutput | undefined {
    const { get, subscribe } = useContext(StoreContext)!;

    const value = useSyncExternalStore(subscribe, () => selector(get()));
    return value;
  }

  function useSetStore(): (value: Updater<Store>, option?: StoreOption) => void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { set } = useContext(StoreContext)!;
    return set;
  }

  const useClearOnDestroy = (value: string | string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { clear } = useContext(StoreContext)!;
    useEffect(
      () => () => {
        clear(value);
      },
      [clear, value],
    );
  };

  const useResetContext = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { clear } = useContext(StoreContext)!;
    return clear;
  };
  return {
    Provider,
    useStore,
    useSetStore,
    useClearOnDestroy,
    useResetContext,
  };
}
