import FloatDatePicker from '@base/antd/components/FloatDatePicker';
import FloatInput from '@base/antd/components/FloatInput';
import CustomUploader from '@base/components/CustomUploader';
import { Toolbox } from '@lib/utils';
import { Button, Col, Form, FormInstance, Radio, Row, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { IoCalendar } from 'react-icons/io5';
import { adsTypes, ENUM_ADS_TYPES } from '../lib/enums';
import { IAdCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IAdCreate>;
  onFinish: (values: IAdCreate) => void;
  backendError?: string | null;
}

const AdsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, backendError }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const formValues = Form.useWatch([], form);

  const getUploaderFieldName = () => {
    if (formValues?.type === ENUM_ADS_TYPES.VIDEO) return 'videoUrl';
    if (formValues?.type === ENUM_ADS_TYPES.EMBEDDED) return 'scriptEmbedCode';
    return 'imageUrl';
  };

  const getUploaderAcceptedTypes = () => {
    if (formValues?.type === ENUM_ADS_TYPES.VIDEO) return ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv'];
    return ['jpg', 'jpeg', 'png'];
  };

  // Show backend error message if provided
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
      
      // Scroll to the first error field
      form.scrollToField(firstErrorField.name, {
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleFinishFn = (values) => {
    const payload = {
      ...values,
      [getUploaderFieldName()]: values.uploader,
    };

    delete payload.uploader;

    onFinish(payload);
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
          startDate: initialValues?.startDate ? dayjs(initialValues.startDate) : null,
          endDate: initialValues?.endDate ? dayjs(initialValues.endDate) : null,
        }}
        onFinish={handleFinishFn}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: '${label} is required!',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="type" className="!mb-0">
              <Radio.Group
                buttonStyle="solid"
                className="w-full text-center"
                onChange={() => form.resetFields(['uploader'])}
              >
                {adsTypes.map((type) => (
                  <Radio.Button className="w-1/3" key={type} value={type}>
                    {Toolbox.toPrettyText(type)}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="uploader"
              // rules={[
              //   {
              //     required: true,
              //     message: 'Image is required!',
              //   },
              // ]}
              className="!mb-0"
            >
              <CustomUploader
                isCrop={formValues?.type === ENUM_ADS_TYPES.IMAGE}
                listType="picture-card"
                acceptedTypes={getUploaderAcceptedTypes()}
                sizeLimit={15}
                initialValues={[formValues?.uploader]}
                onChange={(urls) => form.setFieldValue('uploader', urls[0] || null)}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput placeholder="Title" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="redirectUrl" className="!mb-0">
              <FloatInput placeholder="Redirect Url" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="startDate"
              rules={[
                {
                  required: true,
                  message: 'Start date is required!',
                },
              ]}
              className="!mb-0"
            >
              <FloatDatePicker
                placeholder="Start Date"
                format="YYYY-MM-DD"
                suffixIcon={<IoCalendar />}
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="endDate"
              rules={[
                {
                  required: true,
                  message: 'End date is required!',
                },
              ]}
              className="!mb-0"
            >
              <FloatDatePicker
                placeholder="End Date"
                format="YYYY-MM-DD"
                suffixIcon={<IoCalendar />}
                className="w-full"
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

export default AdsForm;
