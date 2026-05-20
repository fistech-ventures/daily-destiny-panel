'use client';

import { Toolbox } from '@lib/utils';
import { Form, Input } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';

interface IProps {
  name?: string;
}

const BaseSearch: React.FC<IProps> = ({ name = 'searchTerm' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInstance] = Form.useForm();

  const handleChangeFn = (value: any) => {
    const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), [name]: value });
    const queryString = new URLSearchParams(params).toString();

    router.push(`?${queryString}`);
  };

  const debounceSearchFn = Toolbox.debounce(handleChangeFn, 1000);

  useEffect(() => {
    formInstance.setFieldValue(name, searchParams.get(name));
  }, [name, formInstance, searchParams]);

  return (
    <Form form={formInstance}>
      <Form.Item name={name} className="!mb-0">
        <Input
          allowClear
          prefix={<AiOutlineSearch />}
          placeholder="Search"
          onChange={(e) => debounceSearchFn(e.target.value)}
        />
      </Form.Item>
    </Form>
  );
};

export default BaseSearch;
