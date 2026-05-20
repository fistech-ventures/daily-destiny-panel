import { Toolbox } from '@lib/utils';
import { useEffect, useRef } from 'react';

type TCBFunction = (arg1: string, arg2: number) => void;

const useDebounce = (callback: TCBFunction, delay: number = 500) => {
  const debounceCallback = useRef<TCBFunction | null>(null);

  useEffect(() => {
    debounceCallback.current = Toolbox.debounce(callback, delay);
  }, [callback, delay]);

  return debounceCallback.current;
};

export default useDebounce;
