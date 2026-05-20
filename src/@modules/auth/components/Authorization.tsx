import { TPermission } from '@lib/constant';
import { hasAccessPermission } from '../lib/utils/client';

interface IProps {
  allowedAccess: TPermission[];
  children?: React.ReactNode;
  fallBack?: React.ReactNode;
}

const Authorization: React.FC<IProps> = ({ allowedAccess, children = null, fallBack = null }) => {
  const hasAccess: boolean = hasAccessPermission(allowedAccess);

  return hasAccess ? children : fallBack;
};

export default Authorization;
