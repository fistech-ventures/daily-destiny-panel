import { useEffect, useState } from 'react';

const useOnlineStatus = () => {
  const [isOnline, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const handleOnlineFn = () => setOnline(true);
  const handleOfflineFn = () => setOnline(false);

  useEffect(() => {
    window.addEventListener('online', handleOnlineFn);
    window.addEventListener('offline', handleOfflineFn);

    return () => {
      window.removeEventListener('online', handleOnlineFn);
      window.removeEventListener('offline', handleOfflineFn);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;
