import FloatInput from '@base/antd/components/FloatInput';
import CustomUploader from '@base/components/CustomUploader';
import { cn } from '@lib/utils';
import { Button, Col, Form, FormInstance, Radio, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { IAuthorCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IAuthorCreate>;
  onFinish: (values: IAuthorCreate) => void;
}

const AuthorsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish }) => {
  const [activeLang, setActiveLang] = useState<'en' | 'bn'>('en');
  const formValues = Form.useWatch([], form);

  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

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
        onFinish={onFinish}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="image"
              // rules={[
              //   {
              //     required: true,
              //     message: 'Image is required!',
              //   },
              // ]}
              className="!mb-0"
            >
              <CustomUploader
                isCrop
                listType="picture-card"
                initialValues={[formValues?.image]}
                onChange={(urls) => form.setFieldValue('image', urls[0] || null || null)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} className={cn({ '!hidden': activeLang !== 'en' })}>
            <Form.Item name="name" rules={[{ required: true, message: 'Name is required!' }]} className="!mb-0">
              <FloatInput placeholder="Name" />
            </Form.Item>
          </Col>
          <Col xs={24} className={cn({ '!hidden': activeLang !== 'en' })}>
            <Form.Item name="designation" className="!mb-0">
              <FloatInput placeholder="Designation" />
            </Form.Item>
          </Col>
          <Col xs={24} className={cn({ '!hidden': activeLang !== 'bn' })}>
            <Form.Item name="nameBn" rules={[{ required: true, message: 'Name is required!' }]} className="!mb-0">
              <FloatInput placeholder="Name" />
            </Form.Item>
          </Col>
          <Col xs={24} className={cn({ '!hidden': activeLang !== 'bn' })}>
            <Form.Item name="designationBn" className="!mb-0">
              <FloatInput placeholder="Designation" />
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

export default AuthorsForm;
