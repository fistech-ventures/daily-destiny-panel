import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import FloatFormList from '@base/antd/components/FloatFormList';
import FloatTextarea from '@base/antd/components/FloatTextarea';
import { Toolbox } from '@lib/utils';
import { Button, Col, Form, FormInstance, Row } from 'antd';
import React, { useEffect } from 'react';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: { scripts: string[] };
  onFinish: (values: { scripts: string[] }) => void;
}

const SettingsScriptsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish }) => {
  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  return (
    <Form
      autoComplete="off"
      size="large"
      layout="vertical"
      form={form}
      initialValues={Toolbox.isEmpty(initialValues?.scripts) ? { scripts: [''] } : initialValues}
      onFinish={onFinish}
    >
      <Row gutter={[16, 16]}>
        <FloatFormList name="scripts" initialValue={['']}>
          {(fields, { add, remove }) => {
            return (
              <React.Fragment>
                {fields.map(({ key, name, ...rest }, idx) => (
                  <Col xs={24} key={key}>
                    <div className="relative">
                      <Form.Item
                        {...rest}
                        name={name}
                        // rules={[
                        //   {
                        //     required: true,
                        //     message: 'Script is required!',
                        //   },
                        // ]}
                        className="!mb-0"
                      >
                        <FloatTextarea
                          placeholder="Script"
                          autoSize={{ minRows: 2, maxRows: 3 }}
                          style={{ paddingRight: 120 }}
                        />
                      </Form.Item>
                      <Button
                        style={{ position: 'absolute', top: 8, right: 64 }}
                        type="primary"
                        onClick={() => add('', idx + 1)}
                        icon={<PlusOutlined />}
                        ghost
                      />
                      <Button
                        style={{ position: 'absolute', top: 8, right: 16 }}
                        type="dashed"
                        onClick={() => remove(name)}
                        disabled={fields.length < 2}
                        icon={<CloseOutlined />}
                        danger
                      />
                    </div>
                  </Col>
                ))}
              </React.Fragment>
            );
          }}
        </FloatFormList>
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

export default SettingsScriptsForm;
