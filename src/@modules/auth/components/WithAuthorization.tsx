import { TPermission } from '@lib/constant';
import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';
import { hasAccessPermission } from '../lib/utils/client';

interface IOptions {
  allowedAccess: TPermission[];
  fallBack?: React.ReactNode;
}

const WithAuthorization = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  {
    allowedAccess,
    fallBack = (
      <div className="flex justify-center">
        <div className="flex flex-col items-center bg-white dark:bg-[var(--color-black)] p-5 rounded-lg shadow-md">
          <RiAlarmWarningFill color="#ef4444" size={32} className="animate-pulse" />
          <h3 className="text-2xl font-bold text-red-500">Unauthorized Access</h3>
          <p className="mt-2 text-gray-500">You do not have permission to access this page!</p>
        </div>
      </div>
    ),
  }: IOptions,
) => {
  const AuthorizationComponent: React.FC<P> = (props) => {
    const [isLoading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
      setHasAccess(hasAccessPermission(allowedAccess));
      setLoading(false);
    }, []);

    return isLoading ? <Spin /> : hasAccess ? <WrappedComponent {...props} /> : fallBack;
  };

  AuthorizationComponent.displayName = `WithAuthorization(${WrappedComponent.displayName || 'Component'})`;
  return AuthorizationComponent;
};

export default WithAuthorization;
