import { Form, FormItemProps } from 'antd';
import React, { JSX, useMemo } from 'react';

export interface IProps extends FormItemProps {
  children?: JSX.Element;
}

const FloatFormItem: React.FC<IProps> = ({ label = '', required, rules, children, ...rest }) => {
  const isRequired = useMemo(() => {
    if (required) return required;
    return rules?.some((value: any) => value.required !== undefined && value.required !== false);
  }, [required, rules]);

  return (
    <Form.Item {...rest} required={required} rules={rules}>
      {children
        ? React.cloneElement(children, {
            placeholder: label,
            required: isRequired,
          })
        : children}
    </Form.Item>
  );
};

export default FloatFormItem;
