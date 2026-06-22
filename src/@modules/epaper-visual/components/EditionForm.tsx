import { Button, Col, DatePicker, Form, FormInstance, Row } from 'antd';
import React from 'react';
import dayjs from 'dayjs';
import { CreateEditionPayload } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  onFinish: (values: CreateEditionPayload) => void;
  onCancel: () => void;
}

const EditionForm: React.FC<IProps> = ({ isLoading, form, onFinish, onCancel }) => {
  return (
    <Form
      autoComplete="off"
      size="large"
      layout="vertical"
      form={form}
      initialValues={{ status: 'draft' }}
      onFinish={(values) => {
        onFinish({
          ...values,
          publishDate: values.publishDate ? dayjs(values.publishDate).format('YYYY-MM-DD') : values.publishDate,
        });
      }}
      validateMessages={{ required: '${label} is required!' }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Form.Item
            name="publishDate"
            label="Publish Date"
            rules={[{ required: true, message: 'Publish date is required!' }]}
            className="!mb-0"
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item className="!mb-0 mt-4 text-right">
            <Button onClick={onCancel} className="mr-2">
              Cancel
            </Button>
            <Button loading={isLoading} type="primary" htmlType="submit">
              Create Edition
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default EditionForm;
