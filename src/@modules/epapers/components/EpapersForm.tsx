import FloatInput from '@base/antd/components/FloatInput';
import CustomUploader from '@base/components/CustomUploader';
import { IEpaperCreate } from '@modules/epapers/lib/interfaces';
import { Button, Col, DatePicker, Form, FormInstance, Radio, Row } from 'antd';
import React, { useEffect } from 'react';
import dayjs from 'dayjs';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IEpaperCreate>;
  onFinish: (values: IEpaperCreate) => void;
}

const EpapersForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish }) => {
  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  return (
    <React.Fragment>
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={{
          ...initialValues,
          date: initialValues?.date ? dayjs(initialValues.date) : undefined,
          publicationName: 'Daily Destiny',
          isActive: initialValues?.isActive ?? true,
        }}
        onFinish={onFinish}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="date" rules={[{ required: true, message: 'Date is required!' }]} className="!mb-0">
              <DatePicker placeholder="Date" className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="pageNumber" rules={[{ required: true, message: 'Page number is required!' }]} className="!mb-0">
              <FloatInput placeholder="Page Number" type="number" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput placeholder="Title" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="publicationName" className="!mb-0">
              <FloatInput placeholder="Publication Name" disabled />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="imageUrl" rules={[{ required: true, message: 'E-Paper image is required!' }]} className="!mb-0">
              <CustomUploader
                listType="picture-card"
                maxCount={1}
                acceptedTypes={['jpg', 'jpeg', 'png', 'webp']}
                initialValues={initialValues?.imageUrl ? [initialValues.imageUrl] : []}
                onChange={(urls, data) => {
                  if (urls.length > 0) {
                    form.setFieldValue('imageUrl', urls[0]);
                    form.setFieldValue('imageKey', data?.[0]?.key || '');
                  }
                }}
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

export default EpapersForm;
