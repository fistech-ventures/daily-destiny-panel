import FloatInput from '@base/antd/components/FloatInput';
import { Toolbox } from '@lib/utils';
import { Button, Col, Form, FormInstance, Radio, Row, message } from 'antd';
import React, { useEffect } from 'react';
import { ICategoryCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<ICategoryCreate>;
  onFinish: (values: ICategoryCreate) => void;
  backendError?: string | null;
}

const CategoriesForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, backendError }) => {
  const [messageApi, messageHolder] = message.useMessage();

  useEffect(() => {
    if (backendError) {
      messageApi.error(backendError);
    }
  }, [backendError, messageApi]);

  const handleFinishFailed = (errorInfo: any) => {
    const { errorFields } = errorInfo;
    if (errorFields && errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const errorMessage = firstErrorField.errors[0];
      
      messageApi.warning(`${errorMessage}`);
      
      form.scrollToField(firstErrorField.name, {
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleMetaKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const keywords = value.split(',').map((keyword) => keyword.trim());
    form.setFieldsValue({ metaKeywords: keywords });
  };

  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  return (
    <React.Fragment>
      {messageHolder}
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={{
          ...initialValues,
          metaTitle: initialValues?.metaTitle,
          metaDescription: initialValues?.metaDescription,
          metaKeywords: initialValues?.metaKeywords,
        }}
        onFinish={onFinish}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: '${label} is required!',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput
                placeholder="Title (English)"
                onKeyUp={(e) => {
                  form.setFieldValue('slug', Toolbox.generateSlug((e.target as HTMLInputElement).value, '-', false));
                  // form.setFieldValue(
                  //   'metaTitle',
                  //   Toolbox.generateSlug((e.target as HTMLInputElement).value, '-', false),
                  // );
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="titleBn" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput
                placeholder="Title (Bangla)"
                onKeyUp={(e) => {
                  const val = (e.target as HTMLInputElement).value;
                  form.setFieldValue('metaTitle', val);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="metaTitle"
              rules={[{ required: true, message: 'Meta Title is required!' }]}
              className="!mb-0"
            >
              <FloatInput placeholder="Meta Title" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="metaDescription" className="!mb-0">
              <FloatInput placeholder="Meta Description" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="metaKeywords" className="!mb-0">
              <FloatInput onChange={handleMetaKeywordsChange} placeholder="Meta Keywords (comma separated)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="slug" className="!mb-0">
              <FloatInput placeholder="Slug" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="position" className="!mb-0">
              <FloatInput placeholder="Position" />
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

export default CategoriesForm;
