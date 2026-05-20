import { Button, Col, Form, FormInstance, Radio, Row } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { articlesStatusTypes } from '../lib/enums';
import { IArticleCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  initialValues?: {
    status: IArticleCreate['status'];
    date: IArticleCreate['date'];
  };
  onFinish: (values: { status: IArticleCreate['status']; date: IArticleCreate['date'] }) => void;
}

const ArticlesStatusForm: React.FC<IProps> = ({ isLoading, form, initialValues, onFinish }) => {
  // const formValues = Form.useWatch([], form);

  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  return (
    <Form
      autoComplete="off"
      size="large"
      layout="vertical"
      form={form}
      initialValues={{
        ...initialValues,
        date: initialValues?.date ? dayjs(initialValues?.date) : null,
      }}
      onFinish={onFinish}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Form.Item
            // label="Status"
            name="status"
            rules={[
              {
                required: true,
                message: 'Status is required!',
              },
            ]}
            className="!mb-0"
          >
            <Radio.Group>
              {articlesStatusTypes.map((type) => (
                <Radio key={type} value={type}>
                  {type}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Col>
        {/* {formValues?.status === 'Published' && (
          <Col xs={24}>
            <Form.Item
              // label="Date"
              name="date"
              rules={[
                {
                  required: true,
                  message: 'Date is required!',
                },
              ]}
              className="!mb-0"
            >
              <DatePicker placeholder="Date" format="YYYY-MM-DD" suffixIcon={<IoCalendar />} className="w-full" />
            </Form.Item>
          </Col>
        )} */}
        <Col xs={24}>
          <Form.Item className="text-right !mb-0">
            <Button loading={isLoading} type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ArticlesStatusForm;
