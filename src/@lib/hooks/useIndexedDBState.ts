import { Env } from '.environments';
import { useCallback, useEffect, useState } from 'react';

type TIndexedDBStateValue<T> = T;

type TConfig<T> = {
  key: string;
  initialValue: T;
};

const openDBFn = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(Env.webIdentifier, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('web')) {
        db.createObjectStore('web');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getItemFn = async (key: string): Promise<any> => {
  const db = await openDBFn();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('web', 'readonly');
    const store = tx.objectStore('web');
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const setItemFn = async (key: string, value: any): Promise<void> => {
  const db = await openDBFn();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('web', 'readwrite');
    const store = tx.objectStore('web');
    const req = store.put(value, key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const removeItemFn = async (key: string): Promise<void> => {
  const db = await openDBFn();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('web', 'readwrite');
    const store = tx.objectStore('web');
    const req = store.delete(key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const useIndexedDBState = <T = any>(
  config: TConfig<T>,
): [TIndexedDBStateValue<T>, (value: T | ((val: TIndexedDBStateValue<T>) => T)) => void, () => void] => {
  const [storeValue, setStoreValue] = useState<TIndexedDBStateValue<T>>(config.initialValue);

  const handleChangeFn = useCallback(
    (e: Event) => {
      const detail = (e as CustomEvent).detail || {};

      if (detail.key !== config.key) return;
      setStoreValue(detail.value);
    },
    [config.key],
  );

  const setValueFn = useCallback(
    (value: T | ((val: TIndexedDBStateValue<T>) => T)) => {
      const holdValue = value instanceof Function ? value(storeValue) : value;
      setStoreValue(holdValue);
      setItemFn(config.key, holdValue);

      const event = new CustomEvent('onChangeIndexedDB', {
        detail: { key: config.key, value: holdValue },
      });
      window.dispatchEvent(event);
    },
    [config.key, storeValue],
  );

  const clearFn = useCallback(() => {
    setStoreValue(null);
    removeItemFn(config.key);
  }, [config.key]);

  useEffect(() => {
    let isMounted = true;

    const loadValueFn = async () => {
      const item = await getItemFn(config.key);

      if (isMounted) {
        setStoreValue(item ?? config.initialValue);
      }
    };

    loadValueFn();

    window.addEventListener('onChangeIndexedDB', handleChangeFn);
    return () => {
      isMounted = false;
      window.removeEventListener('onChangeIndexedDB', handleChangeFn);
    };
  }, [config.key, config.initialValue, handleChangeFn]);

  return [storeValue, setValueFn, clearFn];
};

export default useIndexedDBState;
