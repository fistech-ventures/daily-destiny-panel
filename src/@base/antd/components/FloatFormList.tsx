import { Form } from 'antd';
import { FormListProps } from 'antd/es/form';
import { NamePath } from 'antd/es/form/interface';
import React, { createContext, PropsWithChildren, useMemo } from 'react';

export interface IFloatFormListContextProps {
  name?: NamePath;
}

export interface IFloatFormListProviderProps extends PropsWithChildren {
  name?: NamePath;
}

export const FloatFormListContext = createContext<IFloatFormListContextProps>({});

export const FloatFormListProvider: React.FC<IFloatFormListProviderProps> = ({ name, children }) => {
  const memoName = useMemo(() => ({ name }), [name]);

  return <FloatFormListContext.Provider value={memoName}>{children}</FloatFormListContext.Provider>;
};

const FloatFormList: React.FC<FormListProps> = ({ name, children, ...rest }) => {
  return (
    <FloatFormListProvider name={name}>
      <Form.List {...rest} name={name}>
        {children}
      </Form.List>
    </FloatFormListProvider>
  );
};

export default FloatFormList;
