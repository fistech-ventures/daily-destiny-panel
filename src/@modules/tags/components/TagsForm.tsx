import FloatInput from '@base/antd/components/FloatInput';
import { ITag, ITagCreate, ITagUpdate } from '@modules/tags/lib/interfaces';
import { Button, Col, Form, FormInstance, Radio, Row } from 'antd';
import React, { useEffect } from 'react';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<ITag>;
  onFinish: (values: ITagCreate | ITagUpdate) => void;
  shouldReset?: boolean;
}

const TagsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, shouldReset }) => {
  const handleFinishFn = (values) => {
    onFinish(values);
  };

  useEffect(() => {
    if (shouldReset) {
      form.resetFields();
    }
  }, [shouldReset, form]);

  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};

export default TagsForm;
