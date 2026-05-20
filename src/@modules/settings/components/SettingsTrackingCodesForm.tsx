import FloatInput from '@base/antd/components/FloatInput';
import { Button, Col, Form, FormInstance, Row } from 'antd';
import React, { useEffect } from 'react';
import { ISettingsTrackingCodes } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<ISettingsTrackingCodes>;
  onFinish: (values: ISettingsTrackingCodes) => void;
}

const SettingsTrackingCodesForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = 'create',
  initialValues,
  onFinish,
}) => {
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
        <Col xs={24} md={12} xl={8}>
          <Form.Item name="gtag_id" className="!mb-0">
            <FloatInput placeholder="GTAG Id" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item name="gtm_id" className="!mb-0">
            <FloatInput placeholder="GTM Id" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Form.Item name="fb_pixel_id" className="!mb-0">
            <FloatInput placeholder="FB Pixel Id" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item className="text-right !mb-0">
            <Button loading={isLoading} type="primary" htmlType="submit">
              {formType === 'create' ? 'Create' : 'Update'}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SettingsTrackingCodesForm;
