import FloatDatePicker from '@base/antd/components/FloatDatePicker';
import FloatFormList from '@base/antd/components/FloatFormList';
import FloatInput from '@base/antd/components/FloatInput';
import FloatInputNumber from '@base/antd/components/FloatInputNumber';
import CustomUploader from '@base/components/CustomUploader';
import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import RichTextEditor from '@base/components/RichTextEditor';
import { Toolbox } from '@lib/utils';
import { AuthorsHooks } from '@modules/authors/lib/hooks';
import { IAuthor } from '@modules/authors/lib/interfaces';
import { Button, Col, Form, FormInstance, Radio, Row, Space, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { IoCalendar } from 'react-icons/io5';
import { IPollCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IPollCreate>;
  onFinish: (values: IPollCreate) => void;
  backendError?: string | null;
}

const PollsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, backendError }) => {
  const [activeLang, setActiveLang] = useState<'en' | 'bn'>('en');
  const formValues = Form.useWatch([], form);
  const [authorSearchTerm, setAuthorSearchTerm] = useState(null);
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
    values.language = activeLang === 'en' ? 'English' : 'Bengali';

    const optionsDiff = Toolbox.computeArrayDiffs(initialValues?.options || [], values?.options || [], 'id');

    onFinish({ ...values, options: optionsDiff });
  };

  const authorQuery = AuthorsHooks.useFindById({
    id: formValues?.authorId,
    config: {
      queryKey: [],
      enabled: !!formValues?.authorId,
    },
  });

  const authorsQuery = AuthorsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: authorSearchTerm,
      isActive: 'true',
    },
  });

  useEffect(() => {
    form.resetFields();

    if (formType === 'update') {
      setActiveLang(initialValues?.language === 'Bengali' ? 'bn' : 'en');
    }
  }, [formType, form, initialValues]);

  return (
    <React.Fragment>
      {messageHolder}
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
        initialValues={{
          ...initialValues,
          date: initialValues?.date ? dayjs(initialValues?.date) : null,
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
              name="coverImage"
              rules={[
                {
                  required: true,
                  message: 'Cover image is required!',
                },
              ]}
              className="!mb-0"
            >
              <CustomUploader
                isCrop
                listType="picture-card"
                initialValues={[formValues?.coverImage]}
                onChange={(urls) => form.setFieldValue('coverImage', urls[0] || null)}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="statement"
              rules={[{ required: true, message: 'Statement is required!' }]}
              className="!mb-0"
            >
              <FloatInput
                placeholder="Statement"
                onKeyUp={(e) =>
                  form.setFieldValue('slug', Toolbox.generateSlug((e.target as HTMLInputElement).value, '-', false))
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="slug" rules={[{ required: true, message: 'Slug is required!' }]} className="!mb-0">
              <FloatInput placeholder="Slug" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="details" rules={[{ required: true, message: 'Content is required!' }]} className="!mb-0">
              <RichTextEditor placeholder="Content" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="date"
              rules={[
                {
                  required: true,
                  message: 'Date is required!',
                },
              ]}
              className="!mb-0"
            >
              <FloatDatePicker placeholder="Date" format="YYYY-MM-DD" suffixIcon={<IoCalendar />} className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="authorId"
              rules={[
                {
                  required: true,
                  message: 'Author is required!',
                },
              ]}
              className="!mb-0"
            >
              <InfiniteScrollSelect<IAuthor>
                isFloat
                allowClear
                showSearch
                virtual={false}
                placeholder="Author"
                initialOptions={authorQuery.data?.data?.id ? [authorQuery.data?.data] : []}
                option={({ item: author }) => ({
                  key: author?.id,
                  label: author?.name,
                  value: author?.id,
                })}
                onChangeSearchTerm={(searchTerm) => setAuthorSearchTerm(searchTerm)}
                query={authorsQuery}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <FloatFormList name="options">
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
                            Option: {idx + 1}
                          </p>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...rest}
                              name={[name, 'title']}
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
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...rest}
                              name={[name, 'position']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Position is required!',
                                },
                              ]}
                              className="!mb-0"
                            >
                              <FloatInputNumber placeholder="Position" className="!w-full" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <div className="flex justify-center gap-4 mt-8">
                          <Button size="small" type="primary" ghost onClick={() => add({}, idx + 1)}>
                            Add More
                          </Button>
                          <Button size="small" type="dashed" onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <Button type="dashed" loading={isLoading} onClick={() => add()} block>
                        Add Option
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

export default PollsForm;
