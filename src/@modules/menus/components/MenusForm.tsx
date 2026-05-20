import FloatInput from '@base/antd/components/FloatInput';
import FloatSelect from '@base/antd/components/FloatSelect';
import { Toolbox } from '@lib/utils';
import { Button, Col, Form, FormInstance, Radio, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { MenusHooks } from '../lib/hooks';
import { IMenuCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IMenuCreate>;
  onFinish: (values: IMenuCreate) => void;
}

const MenusForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish }) => {
  const [activeLang, setActiveLang] = useState<'en' | 'bn'>('en');
  const formValues = Form.useWatch([], form);

  const handleFinishFn = (values) => {
    values.language = activeLang === 'en' ? 'English' : 'Bengali';
    onFinish(values);
  };

  const menusQuery = MenusHooks.useFind({
    options: {
      page: 1,
      limit: 500,
    },
  });

  useEffect(() => {
    form.resetFields();

    if (formType === 'update') {
      setActiveLang(initialValues?.language === 'Bengali' ? 'bn' : 'en');
    }
  }, [formType, form, initialValues]);

  return (
    <React.Fragment>
      <Space className="mb-8">
        <Button size="large" type={activeLang === 'en' ? 'primary' : 'default'} onClick={() => setActiveLang('en')}>
          English
        </Button>
        <Button size="large" type={activeLang === 'bn' ? 'primary' : 'default'} onClick={() => setActiveLang('bn')}>
          বাংলা
        </Button>
      </Space>
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={initialValues}
        onFinish={handleFinishFn}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput
                placeholder="Title"
                onKeyUp={(e) =>
                  form.setFieldValue('slug', Toolbox.generateSlug((e.target as HTMLInputElement).value, '-', false))
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="slug" rules={[{ required: true, message: 'Slug is required!' }]} className="!mb-0">
              <FloatInput placeholder="Slug" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="externalUrl" rules={[{ type: 'url', message: 'Invalid URL!' }]} className="!mb-0">
              <FloatInput placeholder="External Url" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="parentId" className="!mb-0">
              <FloatSelect
                allowClear
                showSearch
                virtual={false}
                loading={menusQuery.isLoading}
                placeholder="Parent"
                filterOption={(input, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                options={menusQuery.data?.data
                  ?.filter((menu) => menu.title !== formValues?.title)
                  .map((menu) => ({
                    key: menu?.id,
                    label: menu?.title,
                    value: menu?.id,
                  }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="isActive" className="!mb-0">
              <Radio.Group buttonStyle="solid" className="w-full text-center">
                <Radio.Button className="w-1/2" value={true}>
                  Active
                </Radio.Button>
                <Radio.Button className="w-1/2" value={false}>
                  Inactive
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item className="text-right !mb-0">
              <Button loading={isLoading} type="primary" htmlType="submit">
                {formType === 'create' ? 'Submit' : 'Update'}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default MenusForm;
