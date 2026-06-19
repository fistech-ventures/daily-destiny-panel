import FloatDatePicker from '@base/antd/components/FloatDatePicker';
import FloatFormList from '@base/antd/components/FloatFormList';
import FloatInput from '@base/antd/components/FloatInput';
import FloatSelect from '@base/antd/components/FloatSelect';
import FloatTextarea from '@base/antd/components/FloatTextarea';
import CustomUploader from '@base/components/CustomUploader';
import InputPhone from '@base/components/InputPhone';
import { TId } from '@base/interfaces';
import { Toolbox } from '@lib/utils';
import { EntrepreneursHooks } from '@modules/entrepreneurs/lib/hooks';
import { Button, Col, Form, FormInstance, Radio, Row, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { IoCalendar } from 'react-icons/io5';
import { IStartupCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IStartupCreate>;
  onFinish: (values: IStartupCreate) => void;
  backendError?: string | null;
}

const StartupsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, backendError }) => {
  const formValues = Form.useWatch([], form);
  const [founderIds, setFounderIds] = useState<Record<number, TId>>({});
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

  const handleFinishFn = (values) => {
    const foundersDiff = Toolbox.computeArrayDiffs(initialValues?.founders || [], values?.founders || [], 'id');

    onFinish({ ...values, founders: foundersDiff });
  };

  const entrepreneursQuery = EntrepreneursHooks.useFind({
    options: {
      page: 1,
      limit: 100,
      isActive: 'true',
    },
  });

  useEffect(() => {
    form.resetFields();

    if (formType === 'create') {
      setFounderIds({ 0: null });
    } else {
      const founders = initialValues?.founders;

      const purifiedFounderIds = founders?.length
        ? founders.reduce((acc, founder, idx) => {
            acc[idx] = founder?.founderId;
            return acc;
          }, {})
        : { 0: null };

      setFounderIds(purifiedFounderIds);
    }
  }, [formType, form, initialValues]);

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
          founders:
            initialValues?.founders?.map((founder) => ({
              ...founder,
              joined: founder.joined ? dayjs(founder.joined) : null,
            })) || [],
          established: initialValues?.established ? dayjs(initialValues?.established) : null,
        }}
        onFinish={handleFinishFn}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: '${label} is required!',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="logo"
              // rules={[
              //   {
              //     required: true,
              //     message: 'Logo is required!',
              //   },
              // ]}
              className="!mb-0"
            >
              <CustomUploader
                isCrop
                listType="picture-card"
                initialValues={[formValues?.logo]}
                onChange={(urls) => form.setFieldValue('logo', urls[0] || null)}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="name" rules={[{ required: true, message: 'Name is required!' }]} className="!mb-0">
              <FloatInput placeholder="Name" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="brief" className="!mb-0">
              <FloatTextarea placeholder="Brief" autoSize={{ maxRows: 5 }} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="website" rules={[{ type: 'url', message: 'Website is not valid!' }]} className="!mb-0">
              <FloatInput placeholder="Website" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="phoneNumber"
              // rules={[
              //   {
              //     required: true,
              //     message: 'Phone number is required!',
              //   },
              // ]}
              className="!mb-0"
            >
              <InputPhone placeholder="Phone Number" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="email"
              rules={[
                {
                  type: 'email',
                  message: 'Email is not valid!',
                },
                // {
                //   required: true,
                //   message: 'Email is required!',
                // },
              ]}
              className="!mb-0"
            >
              <FloatInput placeholder="Email" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="address" className="!mb-0">
              <FloatTextarea placeholder="Address" autoSize={{ maxRows: 3 }} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="established"
              rules={[
                {
                  required: true,
                  message: 'Established is required!',
                },
              ]}
              className="!mb-0"
            >
              <FloatDatePicker
                placeholder="Established"
                format="YYYY-MM-DD"
                suffixIcon={<IoCalendar />}
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <FloatFormList name="founders">
              {(fields, { add, remove }) => {
                return (
                  <React.Fragment>
                    {fields.map(({ key, name, ...rest }, idx) => (
                      <div
                        key={key}
                        className="relative p-4 border border-dashed border-[var(--color-primary-500)] rounded-md pt-8"
                      >
                        <Row gutter={[16, 16]}>
                          <p className="absolute top-0 left-4 -translate-y-1/2 bg-[var(--color-primary-500)] px-1.5 py-0.5 text-xs text-white rounded-md">
                            Founder: {idx + 1}
                          </p>
                          <Col xs={24}>
                            <Form.Item
                              {...rest}
                              name={[name, 'founderId']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Founder is required!',
                                },
                              ]}
                              className="!mb-0"
                            >
                              <FloatSelect
                                virtual={false}
                                allowClear
                                showSearch
                                placeholder="Founder"
                                filterOption={(input, option) =>
                                  option?.title?.toLowerCase().includes(input.toLowerCase())
                                }
                                onChange={(id) => setFounderIds((prev) => ({ ...prev, [idx]: id }))}
                                options={entrepreneursQuery.data?.data?.map((entrepreneur) => ({
                                  title: entrepreneur.name,
                                  label: entrepreneur.name,
                                  value: entrepreneur.id,
                                }))}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...rest}
                              name={[name, 'designation']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Designation is required!',
                                },
                              ]}
                              className="!mb-0"
                            >
                              <FloatInput placeholder="Designation" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...rest}
                              name={[name, 'joined']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Joined is required!',
                                },
                              ]}
                              className="!mb-0"
                            >
                              <FloatDatePicker
                                placeholder="Joined"
                                format="YYYY-MM-DD"
                                suffixIcon={<IoCalendar />}
                                className="w-full"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <div className="flex justify-center gap-4 mt-8">
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            onClick={() => {
                              const purifiedFounderIds = { ...founderIds };
                              const serializedFounderIds = {};
                              let inserted = false;

                              Object.entries(purifiedFounderIds || {})
                                .sort(([a], [b]) => +a - +b)
                                .forEach(([key, value]) => {
                                  const currentIdx = +key;

                                  if (!inserted && currentIdx >= idx + 1) {
                                    serializedFounderIds[idx + 1] = null;
                                    inserted = true;
                                  }

                                  serializedFounderIds[inserted ? currentIdx + 1 : currentIdx] = value;
                                });

                              if (!inserted) {
                                serializedFounderIds[idx + 1] = null;
                              }

                              setFounderIds(serializedFounderIds);
                              add({}, idx + 1);
                            }}
                          >
                            Add More
                          </Button>
                          <Button
                            size="small"
                            type="dashed"
                            onClick={() => {
                              const purifiedFounderIds = { ...founderIds };
                              delete purifiedFounderIds[name];

                              const serializedFounderIds = Object.entries(purifiedFounderIds || {})
                                .sort(([a], [b]) => +a - +b)
                                .reduce((acc, [_, value], idx) => {
                                  acc[idx] = value;
                                  return acc;
                                }, {});

                              setFounderIds(serializedFounderIds);
                              remove(name);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <Button type="dashed" loading={isLoading} onClick={() => add()} block>
                        Add Founder
                      </Button>
                    )}
                  </React.Fragment>
                );
              }}
            </FloatFormList>
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

export default StartupsForm;
