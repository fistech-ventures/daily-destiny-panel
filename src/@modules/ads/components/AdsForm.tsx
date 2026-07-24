import FloatDatePicker from "@base/antd/components/FloatDatePicker";
import FloatInput from "@base/antd/components/FloatInput";
import FloatSelect from "@base/antd/components/FloatSelect";
import CustomUploader from "@base/components/CustomUploader";
import { CategoriesHooks } from "@modules/categories/lib/hooks";
import { Toolbox } from "@lib/utils";
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { IoCalendar } from "react-icons/io5";
import { adsTypes, ENUM_ADS_TYPES } from "../lib/enums";
import { IAdCreate } from "../lib/interfaces";
import { PAGE_TYPES, POSITIONS_BY_PAGE } from "../lib/constants";

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: Partial<IAdCreate>;
  onFinish: (values: IAdCreate) => void;
  backendError?: string | null;
}

const AdsForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = "create",
  initialValues,
  onFinish,
  backendError,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const formValues = Form.useWatch([], form);
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("");

  const categoriesQuery = CategoriesHooks.useFind({
    options: {
      limit: 100,
      searchTerm: categorySearchTerm || undefined,
      isActive: "true",
    },
    config: {
      queryKey: ["categories-for-ads"],
      enabled: formValues?.pageType === "categoryPage",
    },
  });

  const getUploaderFieldName = () => {
    if (formValues?.type === ENUM_ADS_TYPES.VIDEO) return "videoUrl";
    if (formValues?.type === ENUM_ADS_TYPES.EMBEDDED) return "scriptEmbedCode";
    return "imageUrl";
  };

  const getUploaderAcceptedTypes = () => {
    if (formValues?.type === ENUM_ADS_TYPES.VIDEO)
      return ["mp4", "mov", "avi", "wmv", "flv", "mkv"];
    if (formValues?.type === ENUM_ADS_TYPES.ANIMATION)
      return ["gif", "jpg", "jpeg", "png"];
    return [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "svg",
      "mp4",
      "mov",
      "avi",
      "wmv",
      "flv",
      "mkv",
    ];
  };

  const getAvailablePositions = () => {
    if (!formValues?.pageType) return [];
    return (
      POSITIONS_BY_PAGE[
        formValues.pageType as keyof typeof POSITIONS_BY_PAGE
      ] || []
    );
  };

  const handlePageTypeChange = (_value: string) => {
    form.setFieldValue("position", undefined);
    form.setFieldValue("categories", undefined);
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
        behavior: "smooth",
        block: "center",
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

  // Track initialValues via JSON string for deep comparison
  // so that the form is only synced when actual data changes
  // (e.g., switching to edit a different ad), not on every parent re-render
  const prevInitialValuesRef = useRef<string | undefined>(undefined);
  const initialValuesKey = JSON.stringify(initialValues);

  useEffect(() => {
    // Skip if the values haven't actually changed (avoid parent re-render resets)
    if (prevInitialValuesRef.current === initialValuesKey) return;
    prevInitialValuesRef.current = initialValuesKey;

    const mappedInitialValues = {
      ...initialValues,
      uploader:
        initialValues?.imageUrl ||
        initialValues?.videoUrl ||
        initialValues?.scriptEmbedCode ||
        undefined,
      startDate: initialValues?.startDate
        ? dayjs(initialValues.startDate)
        : null,
      endDate: initialValues?.endDate ? dayjs(initialValues.endDate) : null,
    };

    form.resetFields();
    form.setFieldsValue(mappedInitialValues);
  }, [form, initialValuesKey]);

  const categoryOptions = (categoriesQuery.data?.data || []).map((cat) => ({
    label: cat.title,
    value: cat.id,
  }));

  return (
    <React.Fragment>
      {messageHolder}
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={{
          type: ENUM_ADS_TYPES.IMAGE,
          isActive: true,
          ...initialValues,
          uploader:
            initialValues?.imageUrl ||
            initialValues?.videoUrl ||
            initialValues?.scriptEmbedCode ||
            undefined,
          startDate: initialValues?.startDate
            ? dayjs(initialValues.startDate)
            : null,
          endDate: initialValues?.endDate ? dayjs(initialValues.endDate) : null,
        }}
        onFinish={handleFinishFn}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: "${label} is required!",
        }}
      >
        <Row gutter={[16, 16]}>
          {/* 1. Type */}
          <Col xs={24}>
            <Form.Item name="type" className="!mb-0">
              <Radio.Group
                buttonStyle="solid"
                className="w-full text-center"
                onChange={() => form.resetFields(["uploader"])}
              >
                {adsTypes.map((type) => (
                  <Radio.Button className="w-1/4" key={type} value={type}>
                    {Toolbox.toPrettyText(type)}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>

          {/* 2. File Upload / Embed Code */}
          {formValues?.type !== ENUM_ADS_TYPES.EMBEDDED && (
            <Col xs={24}>
              <Form.Item name="uploader" className="!mb-0">
                <CustomUploader
                  listType="picture-card"
                  acceptedTypes={getUploaderAcceptedTypes()}
                  sizeLimit={15}
                  initialValues={
                    formValues?.uploader ? [formValues.uploader] : []
                  }
                  onChange={(urls) =>
                    form.setFieldValue("uploader", urls[0] || null)
                  }
                />
              </Form.Item>
            </Col>
          )}

          {formValues?.type === ENUM_ADS_TYPES.EMBEDDED && (
            <Col xs={24}>
              <Form.Item name="uploader" className="!mb-0">
                <Input.TextArea
                  placeholder="Paste your embed/script code here"
                  rows={5}
                />
              </Form.Item>
            </Col>
          )}

          {/* 3. Page Type */}
          <Col xs={24}>
            <Form.Item name="pageType" className="!mb-0">
              <FloatSelect
                placeholder="Page Type"
                options={PAGE_TYPES.map((type) => ({
                  label: type.label,
                  value: type.value,
                }))}
                onChange={handlePageTypeChange}
                allowClear
              />
            </Form.Item>
          </Col>

          {/* 4. Position */}
          <Col xs={24}>
            <Form.Item name="position" className="!mb-0">
              <FloatSelect
                placeholder="Position"
                options={getAvailablePositions().map((pos) => ({
                  label: pos,
                  value: pos,
                }))}
                disabled={!formValues?.pageType}
                allowClear
              />
            </Form.Item>
          </Col>

          {/* 5. Categories (only for categoryPage) */}
          {formValues?.pageType === "categoryPage" && (
            <Col xs={24}>
              <Form.Item name="categories" className="!mb-0">
                <Select
                  mode="multiple"
                  placeholder="Select categories"
                  options={categoryOptions}
                  loading={categoriesQuery.isLoading}
                  onSearch={Toolbox.debounce(setCategorySearchTerm, 500)}
                  filterOption={false}
                  allowClear
                  showSearch
                />
              </Form.Item>
            </Col>
          )}

          {/* 6. Title */}
          <Col xs={24}>
            <Form.Item
              name="title"
              rules={[{ required: true, message: "Title is required!" }]}
              className="!mb-0"
            >
              <FloatInput placeholder="Title" />
            </Form.Item>
          </Col>

          {/* 7. Redirect URL */}
          <Col xs={24}>
            <Form.Item name="redirectUrl" className="!mb-0">
              <FloatInput placeholder="Redirect Url" />
            </Form.Item>
          </Col>

          {/* 8. Start Date */}
          <Col xs={24}>
            <Form.Item
              name="startDate"
              rules={[
                {
                  required: true,
                  message: "Start date is required!",
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

          {/* 9. End Date */}
          <Col xs={24}>
            <Form.Item
              name="endDate"
              rules={[
                {
                  required: true,
                  message: "End date is required!",
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

          {/* 10. Status */}
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

          {/* Submit */}
          <Col xs={24}>
            <Form.Item className="text-right !mb-0">
              <Button loading={isLoading} type="primary" htmlType="submit">
                {formType === "create" ? "Submit" : "Update"}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default AdsForm;
