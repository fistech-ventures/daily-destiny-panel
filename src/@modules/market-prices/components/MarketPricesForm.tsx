import FloatInput from '@base/antd/components/FloatInput';
import CustomUploader from '@base/components/CustomUploader';
import { cn } from '@lib/utils';
import { Button, Col, Form, FormInstance, InputNumber, Radio, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { IMarketPriceCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IMarketPriceCreate>;
  onFinish: (values: IMarketPriceCreate) => void;
}

const MarketPricesForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish }) => {
  const [activeLang, setActiveLang] = useState<'en' | 'bn'>('en');

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
        onFinishFailed={(errorInfo) => {
          const errorFields = errorInfo.errorFields.map((field) => field.name[0]);
          if (errorFields.includes('title') && !errorFields.includes('titleBn')) {
            setActiveLang('en');
          } else if (errorFields.includes('titleBn') && !errorFields.includes('title')) {
            setActiveLang('bn');
          } else if (errorFields.includes('title') && activeLang !== 'en') {
            setActiveLang('en');
          } else if (errorFields.includes('titleBn') && activeLang !== 'bn') {
            setActiveLang('bn');
          }
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} className={cn({ '!hidden': activeLang !== 'en' })}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput placeholder="Title" />
            </Form.Item>
          </Col>
          <Col xs={24} className={cn({ '!hidden': activeLang !== 'bn' })}>
            <Form.Item name="titleBn" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput placeholder="Title (Bn)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="image" label="Image" className="!mb-0" getValueFromEvent={(urls) => urls?.[0] || null}>
              <CustomUploader
                listType="picture-card"
                sizeLimit={15}
                initialValues={initialValues?.image ? [initialValues.image] : []}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="priceRange"
              rules={[{ required: true, message: 'Price Range is required!' }]}
              className="!mb-0"
            >
              <FloatInput placeholder="Price Range (e.g., 340 to 360 per kg)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              label="Position"
              name="position"
              rules={[{ required: true, message: 'Position is required!' }]}
              className="!mb-0 w-full"
            >
              <InputNumber placeholder="Position" className="w-full" style={{ width: '100%', height: 48 }} />
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

export default MarketPricesForm;
