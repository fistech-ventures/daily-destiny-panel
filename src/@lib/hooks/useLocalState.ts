import { useEffect, useState } from 'react';

export interface ILocalStateEvent extends Event {
  key: string;
  value: any;
}

type TLocalStateValue<T> = T;

type TConfig<T> = {
  key: string;
  initialValue: T;
};

const useLocalState = <T = any>(
  config: TConfig<T>,
): [TLocalStateValue<T>, (value: T | ((val: TLocalStateValue<T>) => T)) => void, () => void] => {
  const [storeValue, setStoreValue] = useState<TLocalStateValue<T>>(config.initialValue);

  const handleChangeFn = (e: ILocalStateEvent) => {
    if (e.key !== config.key || e.type !== 'onChangeLocalState') return;
    setStoreValue(e.value);
  };

  const setValueFn = (value: T | ((val: TLocalStateValue<T>) => T)) => {
    const event = new Event('onChangeLocalState') as ILocalStateEvent;

    const holdValue = value instanceof Function ? value(storeValue) : value;
    event.key = config.key;
    event.value = holdValue;
    window.dispatchEvent(event);
    localStorage.setItem(config.key, JSON.stringify(holdValue));
  };

  const getValueFn = (): T => {
    if (typeof window === 'undefined') {
      return config.initialValue;
    } else {
      const item = localStorage.getItem(config.key);
      return item ? JSON.parse(item) : config.initialValue;
    }
  };

  const clearFn = () => {
    setValueFn(null);
    localStorage.removeItem(config.key);
  };

  useEffect(() => {
    setStoreValue(getValueFn());

    window.addEventListener('onChangeLocalState', handleChangeFn);
    return () => window.removeEventListener('onChangeLocalState', handleChangeFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storeValue, setValueFn, clearFn];
};

export default useLocalState;
