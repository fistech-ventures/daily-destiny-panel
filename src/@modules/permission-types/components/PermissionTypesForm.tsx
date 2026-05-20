import FloatInput from '@base/antd/components/FloatInput';
import { Button, Col, Form, FormInstance, Radio, Row } from 'antd';
import React, { useEffect } from 'react';
import { IPermissionTypeCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IPermissionTypeCreate>;
  onFinish: (values: IPermissionTypeCreate) => void;
}

const PermissionTypesForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish }) => {
  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  return (
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
            name="title"
            rules={[
              {
                required: true,
                message: 'Title is required!',
              },
            ]}
            className="!mb-0"
          >
            <FloatInput placeholder="Title" />
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
  );
};

export default PermissionTypesForm;
