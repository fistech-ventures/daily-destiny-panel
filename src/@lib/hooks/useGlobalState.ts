import { useEffect, useState } from 'react';

export interface IGlobalStateEvent extends Event {
  key: string;
  value: any;
}

type TGlobalStateValue<T> = T;

type TConfig<T> = {
  key: string;
  initialValue: T;
};

const useGlobalState = <T = any>(
  config: TConfig<T>,
): [TGlobalStateValue<T>, (value: T | ((val: TGlobalStateValue<T>) => T)) => void, () => void] => {
  const [storeValue, setStoreValue] = useState<TGlobalStateValue<T>>(config.initialValue);

  const handleChangeFn = (e: IGlobalStateEvent) => {
    if (e.key !== config.key || e.type !== 'onChangeGlobalState') return;
    setStoreValue(e.value);
  };

  const setValueFn = (value: T | ((val: TGlobalStateValue<T>) => T)) => {
    const event = new Event('onChangeGlobalState') as IGlobalStateEvent;

    const holdValue = value instanceof Function ? value(storeValue) : value;
    event.key = config.key;
    event.value = holdValue;
    window.dispatchEvent(event);
  };

  const clearFn = () => setValueFn(null);

  useEffect(() => {
    window.addEventListener('onChangeGlobalState', handleChangeFn);
    return () => window.removeEventListener('onChangeGlobalState', handleChangeFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storeValue, setValueFn, clearFn];
};

export default useGlobalState;
