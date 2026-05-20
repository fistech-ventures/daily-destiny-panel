import { useEffect, useState } from 'react';

export interface ISessionStateEvent extends Event {
  key: string;
  value: any;
}

type TSessionStateValue<T> = T;

type TConfig<T> = {
  key: string;
  initialValue: T;
};

const useSessionState = <T = any>(
  config: TConfig<T>,
): [TSessionStateValue<T>, (value: T | ((val: TSessionStateValue<T>) => T)) => void, () => void] => {
  const [storeValue, setStoreValue] = useState<TSessionStateValue<T>>(config.initialValue);

  const handleChangeFn = (e: ISessionStateEvent) => {
    if (e.key !== config.key || e.type !== 'onChangeSessionState') return;
    setStoreValue(e.value);
  };

  const setValueFn = (value: T | ((val: TSessionStateValue<T>) => T)) => {
    const event = new Event('onChangeSessionState') as ISessionStateEvent;

    const holdValue = value instanceof Function ? value(storeValue) : value;
    event.key = config.key;
    event.value = holdValue;
    window.dispatchEvent(event);
    sessionStorage.setItem(config.key, JSON.stringify(holdValue));
  };

  const getValueFn = (): T => {
    if (typeof window === 'undefined') {
      return config.initialValue;
    } else {
      const item = sessionStorage.getItem(config.key);
      return item ? JSON.parse(item) : config.initialValue;
    }
  };

  const clearFn = () => {
    setValueFn(null);
    sessionStorage.removeItem(config.key);
  };

  useEffect(() => {
    setStoreValue(getValueFn());

    window.addEventListener('onChangeSessionState', handleChangeFn);
    return () => window.removeEventListener('onChangeSessionState', handleChangeFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storeValue, setValueFn, clearFn];
};

export default useSessionState;
