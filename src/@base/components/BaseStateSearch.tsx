import { Toolbox } from '@lib/utils';
import { Form, FormInstance, Input, InputProps } from 'antd';
import React, { useImperativeHandle, useState } from 'react';

interface IProps extends InputProps {
  onSearch: (value: string) => void;
}

interface IRefProps {
  formInstance: FormInstance;
  clearSearch: () => void;
}

const BaseStateSearch = React.forwardRef<IRefProps, IProps>(({ placeholder, onSearch, ...rest }, ref) => {
  const [formInstance] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState(null);

  const handleChangeFn = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const debounceSearchFn = Toolbox.debounce(handleChangeFn, 1000);

  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      formInstance.resetFields();
      setSearchTerm(null);
    },
    formInstance,
  }));

  return (
    <Form form={formInstance}>
      <Form.Item name="searchTerm" className="!mb-0">
        <Input
          {...rest}
          placeholder={placeholder || 'Search'}
          value={searchTerm}
          onChange={(e) => debounceSearchFn(e.target.value)}
        />
      </Form.Item>
    </Form>
  );
});

BaseStateSearch.displayName = 'BaseStateSearch';

export default BaseStateSearch;
