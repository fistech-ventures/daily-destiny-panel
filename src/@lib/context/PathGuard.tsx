import AdminLayout from '@base/layouts/AdminLayout';
import { AuthPaths } from '@lib/constant';
import { Toolbox } from '@lib/utils';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

type TProps = PropsWithChildren<{}>;

const PathGuard: React.FC<TProps> = ({ children }) => {
  const pathname = usePathname();

  return Toolbox.isDynamicPath(AuthPaths, pathname) ? <AdminLayout>{children}</AdminLayout> : children;
};

export default PathGuard;
