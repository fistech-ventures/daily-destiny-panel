import React, { type PropsWithChildren } from 'react';

type TProps = PropsWithChildren<{}>;

const Layout: React.FC<TProps> = ({ children }) => {
  return children;
};

export default Layout;
