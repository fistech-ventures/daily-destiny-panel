import FloatDatePicker from "@base/antd/components/FloatDatePicker";
import FloatInput from "@base/antd/components/FloatInput";
import FloatSelect from "@base/antd/components/FloatSelect";
import FloatTextarea from "@base/antd/components/FloatTextarea";
import CustomUploader from "@base/components/CustomUploader";
import InfiniteScrollSelect from "@base/components/InfiniteScrollSelect";
import RichTextEditor from "@base/components/RichTextEditor";
import TagSelector from "@base/components/TagSelector";
import { Toolbox } from "@lib/utils";
import { AuthorsHooks } from "@modules/authors/lib/hooks";
import { IAuthor } from "@modules/authors/lib/interfaces";
import { CategoriesHooks } from "@modules/categories/lib/hooks";
import { ICategory } from "@modules/categories/lib/interfaces";
import { LocationsHooks } from "@modules/locations/lib/hooks";
import { ILocation } from "@modules/locations/lib/interfaces";
import { SubCategoriesHooks } from "@modules/sub-categories/lib/hooks";
import { ISubCategory } from "@modules/sub-categories/lib/interfaces";
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Radio,
  Row,
  Select,
  Space,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { IoCalendar } from "react-icons/io5";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { IArticleCreate } from "../lib/interfaces";

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: "create" | "update";
  initialValues?: Partial<IArticleCreate> & {
    categories?: ICategory[];
    subCategories?: ISubCategory[];
  };
  onFinish: (values: IArticleCreate) => void;
  shouldReset?: boolean;
  backendError?: string | null;
}

const ArticlesForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = "create",
  initialValues,
  onFinish,
  shouldReset,
  backendError,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [activeLang, setActiveLang] = useState<"en" | "bn">("bn");
  const currentType = React.useMemo(
    () => initialValues?.type,
    [initialValues?.type],
  );
  // Stable initial values map for photo medias (prevents CustomUploader reset on re-render)
  const photoMediaInitialValues = React.useMemo(() => {
    const map: Record<number, string[]> = {};
    if (initialValues?.medias) {
      initialValues.medias.forEach((media, idx) => {
        if (media?.url) {
          map[idx] = [media.url];
        }
      });
    }
    return map;
  }, [initialValues?.medias]);

  const [categorySearchTerm, setCategorySearchTerm] = useState(null);
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState(null);
  const [authorSearchTerm, setAuthorSearchTerm] = useState(null);
  const [divisionSearchTerm, setDivisionSearchTerm] = useState(null);
  const [districtSearchTerm, setDistrictSearchTerm] = useState(null);
  const [upazillaSearchTerm, setUpazillaSearchTerm] = useState(null);

  // Watch form fields reactively for dependent dropdown queries
  const watchedCategoryIds = Form.useWatch("categoryIds", form);
  const watchedDivisionId = Form.useWatch("divisionId", form);
  const watchedDistrictId = Form.useWatch("districtId", form);

  const effectiveCategoryIds = watchedCategoryIds ?? [];
  const effectiveDivisionId = watchedDivisionId ?? initialValues?.divisionId;
  const effectiveDistrictId = watchedDistrictId ?? initialValues?.districtId;

  const getFileMeta = (url: string) => {
    if (!url) return { extension: "", mimetype: "" };
    const extension = url.split(".").pop()?.toLowerCase();
    let mimetype = "";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension || "")) {
      mimetype = `image/${extension}`;
    } else if (["mp4", "webm", "ogg"].includes(extension || "")) {
      mimetype = `video/${extension}`;
    }
    return { extension: extension ? `.${extension}` : "", mimetype };
  };

  const extractVideoKey = (url: string, source: string) => {
    try {
      if (!url) return "";
      if (source === "youtube") {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes("youtube.com"))
          return urlObj.searchParams.get("v") || "";
        if (urlObj.hostname.includes("youtu.be"))
          return urlObj.pathname.slice(1);
      }
      if (source === "facebook") {
        const urlObj = new URL(url);

        // Pattern 1: ?v=VIDEO_ID
        if (urlObj.searchParams.has("v"))
          return urlObj.searchParams.get("v") || "";

        const paths = urlObj.pathname.split("/").filter(Boolean);

        // Pattern 2: /videos/VIDEO_ID/
        if (paths.includes("videos"))
          return paths[paths.indexOf("videos") + 1] || "";

        // Pattern 3: /share/v/VIDEO_ID/
        if (paths.includes("share") && paths.includes("v"))
          return paths[paths.indexOf("v") + 1] || "";

        // Pattern 4: /reel/VIDEO_ID/
        if (paths.includes("reel"))
          return paths[paths.indexOf("reel") + 1] || "";
      }
    } catch (e) {
      console.error(e);
      return "";
    }
    return "";
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
    values.language = activeLang === "en" ? "English" : "Bengali";

    if (values.medias?.length) {
      values.medias = values.medias.map((media) => {
        const meta = getFileMeta(media.url || "");
        let mimetype = media.mimetype || meta.mimetype;
        let extension = media.extension || meta.extension;

        if (!mimetype) {
          if (media.source === "youtube" || media.source === "facebook") {
            mimetype = "video/mp4";
            extension = ".mp4";
          } else {
            mimetype = "image/jpeg";
            extension = ".jpg";
          }
        }

        let key = media.key || "";
        if (
          !key &&
          (media.source === "youtube" || media.source === "facebook")
        ) {
          key = extractVideoKey(media.url || "", media.source);
        }

        return {
          title: media.title,
          caption: media.caption,
          credit: media.credit,
          altText: media.altText,
          url: media.url,
          source: media.source || "do-space",
          mimetype,
          extension,
          key,
        };
      });
    }
    // TagSelector already returns an array, so no need to split
    if (values.tags && typeof values.tags === "string") {
      // Handle legacy string format for backward compatibility
      values.tags = values.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean);
    }

    // Resolve plain-text author: if authorName is provided without a selected authorId, use it
    if (values.authorName && !values.authorId) {
      values.authorId = values.authorName;
    }
    delete values.authorName;

    // Map leadType string to isExclusive boolean + position
    if (values.leadType === "lead") {
      values.isExclusive = true;
    } else if (values.leadType === "second-lead") {
      values.isExclusive = true;
      values.position = 2;
    } else if (values.leadType === "non-lead") {
      values.isExclusive = false;
      values.position = 0;
    }
    delete values.leadType;

    onFinish(values);
  };

  const categoriesQuery = CategoriesHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: categorySearchTerm,
      isActive: "true",
    },
  });

  const subCategoriesQuery = SubCategoriesHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: subCategorySearchTerm,
      isActive: "true",
      categoryId:
        effectiveCategoryIds.length === 1
          ? String(effectiveCategoryIds[0])
          : undefined,
      categoryIds:
        effectiveCategoryIds.length > 1
          ? effectiveCategoryIds.map(String)
          : undefined,
    },
  });

  const authorQuery = AuthorsHooks.useFindById({
    id: initialValues?.authorId,
    config: {
      queryKey: [],
      enabled: !!initialValues?.authorId,
    },
  });

  const authorsQuery = AuthorsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: authorSearchTerm,
      isActive: "true",
    },
  });

  const divisionQuery = LocationsHooks.useFindById({
    id: initialValues?.divisionId,
    config: {
      queryKey: [],
      enabled: !!initialValues?.divisionId,
    },
  });

  const divisionsQuery = LocationsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: divisionSearchTerm,
      isActive: "true",
      type: "division",
    },
  });

  const districtQuery = LocationsHooks.useFindById({
    id: initialValues?.districtId,
    config: {
      queryKey: [],
      enabled: !!initialValues?.districtId,
    },
  });

  const districtsQuery = LocationsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: districtSearchTerm,
      isActive: "true",
      type: "district",
      parentId: effectiveDivisionId || undefined,
    },
  });

  const upazillaQuery = LocationsHooks.useFindById({
    id: initialValues?.upazillaId,
    config: {
      queryKey: [],
      enabled: !!initialValues?.upazillaId,
    },
  });

  const upazillasQuery = LocationsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: upazillaSearchTerm,
      isActive: "true",
      type: "upazilla",
      parentId: effectiveDistrictId || undefined,
    },
  });

  useEffect(() => {
    if (formType === "update") {
      setActiveLang(initialValues?.language === "Bengali" ? "bn" : "en");
    }
  }, [formType, form, initialValues]);

  useEffect(() => {
    if (shouldReset) {
      form.resetFields();
    }
  }, [shouldReset, form]);

  // Reset position to 0 when article is changed from featured to non-featured or exclusive to non-exclusive
  useEffect(() => {
    if (formType === "update" && initialValues) {
      const currentValues = form.getFieldsValue();

      // Check if isFeatured changed from true to false
      if (
        initialValues.isFeatured === true &&
        currentValues.isFeatured === false
      ) {
        form.setFieldValue("position", 0);
      }

      // Check if leadType changed from lead/second-lead to non-lead
      if (
        initialValues.isExclusive === true &&
        currentValues.leadType === "non-lead"
      ) {
        form.setFieldValue("position", 0);
      }
    }
  }, [
    formType,
    initialValues,
    initialValues?.isFeatured,
    initialValues?.isExclusive,
    form,
  ]);

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
          leadType:
            initialValues?.isExclusive === true
              ? initialValues?.position === 2
                ? "second-lead"
                : "lead"
              : "non-lead",
          metaTitle:
            initialValues?.metaTitle ||
            initialValues?.seoMetaData?.title ||
            initialValues?.title,
          metaDescription:
            initialValues?.metaDescription ||
            initialValues?.seoMetaData?.description ||
            initialValues?.excerpt,
          date: initialValues?.date ? dayjs(initialValues?.date) : dayjs(),
        }}
        onFinish={handleFinishFn}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: "${label} is required!",
        }}
      >
        <Row gutter={[16, 16]}>
          {currentType === "video" ? (
            <>
              <Col xs={12}>
                <Form.Item className="!mb-0">
                  <Space>
                    <Button
                      type={activeLang === "bn" ? "primary" : "default"}
                      onClick={() => setActiveLang("bn")}
                    >
                      বাংলা
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item name="position" initialValue={0} className="!mb-0">
                  <FloatInput placeholder="Position" type="number" />
                </Form.Item>
              </Col>
            </>
          ) : (
            <Col xs={24} sm={12}>
              <Form.Item className="!mb-0">
                <Space>
                  <Button
                    type={activeLang === "bn" ? "primary" : "default"}
                    onClick={() => setActiveLang("bn")}
                  >
                    বাংলা
                  </Button>
                  {/* <Button type={activeLang === 'en' ? 'primary' : 'default'} onClick={() => setActiveLang('en')}>
                    English
                  </Button> */}
                </Space>
              </Form.Item>
              <Form.Item
                name="position"
                initialValue={0}
                className="!mb-0 !mt-3"
              >
                <FloatInput placeholder="Position" type="number" />
              </Form.Item>
            </Col>
          )}

          {currentType !== "video" &&
            currentType !== "photo" &&
            formType !== "create" && (
              <Col xs={24} sm={12}>
                <Form.Item
                  name="type"
                  rules={[{ required: true, message: "Type is required!" }]}
                  className="!mb-0"
                >
                  <FloatSelect
                    placeholder="Type"
                    disabled={initialValues?.type !== undefined}
                    options={[
                      { value: "news", label: "News" },
                      { value: "series", label: "Series" },
                      { value: "stories", label: "Stories" },
                      { value: "photo", label: "Photo" },
                      { value: "video", label: "Video" },
                    ]}
                  />
                </Form.Item>
              </Col>
            )}
          {(currentType === "video" ||
            currentType === "photo" ||
            formType === "create") && (
            <Form.Item name="type" hidden>
              <input />
            </Form.Item>
          )}

          {["news", "series", "stories"].includes(currentType) && (
            <Col xs={24}>
              <Form.Item
                name="details"
                rules={[{ required: true, message: "Content is required!" }]}
                className="!mb-0"
              >
                <RichTextEditor placeholder="Content" />
              </Form.Item>
            </Col>
          )}

          {currentType !== "video" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="coverImage"
                rules={
                  currentType !== "photo"
                    ? [{ required: true, message: "Cover image is required!" }]
                    : undefined
                }
                className="!mb-0"
              >
                <CustomUploader
                  listType="picture-card"
                  initialValues={[initialValues?.coverImage]}
                  onChange={(urls) =>
                    form.setFieldValue("coverImage", urls[0] || null)
                  }
                />
              </Form.Item>
            </Col>
          )}

          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="coverImageCredit"
                rules={
                  currentType !== "photo"
                    ? [
                        {
                          required: true,
                          message: "Cover image credit is required",
                        },
                      ]
                    : undefined
                }
                className="!mb-0"
              >
                <FloatInput placeholder="Cover Image Credit" />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} sm={currentType === "video" ? 12 : 12}>
            <Form.Item
              name="title"
              rules={[{ required: true, message: "Title is required!" }]}
              className="!mb-0"
            >
              <FloatInput
                placeholder="Title"
                onKeyUp={(e) => {
                  const val = (e.target as HTMLInputElement).value;
                  setTimeout(() => {
                    form.setFieldValue(
                      "slug",
                      Toolbox.generateSlug(val, "-", false),
                    );
                    if (currentType !== "video" && currentType !== "photo") {
                      form.setFieldValue("metaTitle", val);
                    }
                  }, 0);
                }}
              />
            </Form.Item>
          </Col>
          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="metaTitle"
                rules={[{ required: true, message: "Meta title is required!" }]}
                className="!mb-0"
              >
                <FloatInput placeholder="Meta Title" />
              </Form.Item>
            </Col>
          )}

          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24}>
              <Form.Item
                name="excerpt"
                rules={[{ required: true, message: "Excerpt is required!" }]}
                className="!mb-0"
              >
                <FloatTextarea
                  placeholder="Excerpt"
                  autoSize={{ maxRows: 3 }}
                  onKeyUp={(e) => {
                    const val = (e.target as HTMLTextAreaElement).value;
                    setTimeout(() => {
                      form.setFieldValue("metaDescription", val);
                    }, 0);
                  }}
                />
              </Form.Item>
            </Col>
          )}
          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24}>
              <Form.Item
                name="metaDescription"
                rules={[
                  { required: true, message: "Meta description is required!" },
                ]}
                className="!mb-0"
              >
                <FloatTextarea
                  placeholder="Meta Description"
                  autoSize={{ maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          )}

          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="date"
                rules={[{ required: true, message: "Date is required!" }]}
                className="!mb-0"
              >
                <FloatDatePicker
                  showTime
                  placeholder="Date (Defaults to now)"
                  format="YYYY-MM-DD hh:mm A"
                  suffixIcon={<IoCalendar />}
                  className="w-full"
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} sm={12}>
            <Form.Item
              name="slug"
              rules={[{ required: true, message: "Slug is required!" }]}
              className="!mb-0"
            >
              <FloatInput placeholder="Slug" />
            </Form.Item>
          </Col>

          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="categoryIds"
                rules={[{ required: true, message: "Category is required!" }]}
                className="!mb-0"
              >
                <InfiniteScrollSelect<ICategory>
                  isFloat
                  allowClear
                  showSearch
                  virtual={false}
                  mode="multiple"
                  placeholder="Category"
                  initialOptions={initialValues?.categories || []}
                  option={({ item: category }) => ({
                    key: category?.id,
                    label: `${category?.title} (${category?.titleBn})`,
                    value: category?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) =>
                    setCategorySearchTerm(searchTerm)
                  }
                  query={categoriesQuery}
                />
              </Form.Item>
            </Col>
          )}
          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="subCategoryIds"
                className="!mb-0"
                rules={[{ required: false }]}
              >
                <InfiniteScrollSelect<ISubCategory>
                  isFloat
                  allowClear
                  showSearch
                  virtual={false}
                  mode="multiple"
                  placeholder="Sub Category (Optional)"
                  initialOptions={initialValues?.subCategories || []}
                  option={({ item: subCategory }) => ({
                    key: subCategory?.id,
                    label: subCategory?.title,
                    value: subCategory?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) =>
                    setSubCategorySearchTerm(searchTerm)
                  }
                  query={subCategoriesQuery}
                  disabled={!effectiveCategoryIds.length}
                />
              </Form.Item>
            </Col>
          )}
          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="divisionId"
                className="!mb-0"
                rules={[{ required: false }]}
              >
                <InfiniteScrollSelect<ILocation>
                  isFloat
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Division (Optional)"
                  initialOptions={
                    divisionQuery.data?.data?.id
                      ? [divisionQuery.data?.data]
                      : []
                  }
                  option={({ item: location }) => ({
                    key: location?.id,
                    label: `${location?.name} (${location?.nameBn})`,
                    value: location?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) =>
                    setDivisionSearchTerm(searchTerm)
                  }
                  query={divisionsQuery}
                  onChange={() => {
                    form.setFieldValue("districtId", undefined);
                    form.setFieldValue("upazillaId", undefined);
                  }}
                />
              </Form.Item>
            </Col>
          )}
          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="districtId"
                className="!mb-0"
                rules={[{ required: false }]}
              >
                <InfiniteScrollSelect<ILocation>
                  isFloat
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="District (Optional)"
                  initialOptions={
                    districtQuery.data?.data?.id
                      ? [districtQuery.data?.data]
                      : []
                  }
                  option={({ item: location }) => ({
                    key: location?.id,
                    label: `${location?.name} (${location?.nameBn})`,
                    value: location?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) =>
                    setDistrictSearchTerm(searchTerm)
                  }
                  query={districtsQuery}
                  disabled={!form.getFieldValue("divisionId")}
                  onChange={() => {
                    form.setFieldValue("upazillaId", undefined);
                  }}
                />
              </Form.Item>
            </Col>
          )}
          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="upazillaId"
                className="!mb-0"
                rules={[{ required: false }]}
              >
                <InfiniteScrollSelect<ILocation>
                  isFloat
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Upazilla (Optional)"
                  initialOptions={
                    upazillaQuery.data?.data?.id
                      ? [upazillaQuery.data?.data]
                      : []
                  }
                  option={({ item: location }) => ({
                    key: location?.id,
                    label: `${location?.name} (${location?.nameBn})`,
                    value: location?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) =>
                    setUpazillaSearchTerm(searchTerm)
                  }
                  query={upazillasQuery}
                  disabled={!form.getFieldValue("districtId")}
                />
              </Form.Item>
            </Col>
          )}

          {currentType === "video" && (
            <Col xs={24}>
              <Card title="Video Media" className="mb-4">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name={["medias", 0, "source"]}
                      rules={[
                        {
                          required: true,
                          message: "Video source is required!",
                        },
                      ]}
                      className="!mb-0"
                    >
                      <Select
                        placeholder="Select Video Source"
                        className="w-full"
                        options={[
                          { value: "youtube", label: "YouTube" },
                          { value: "do-space", label: "Upload Video" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.medias?.[0]?.source !==
                        currentValues.medias?.[0]?.source
                      }
                    >
                      {({ getFieldValue }) => {
                        const source = getFieldValue(["medias", 0, "source"]);
                        return source === "do-space" ? (
                          <Form.Item
                            name={["medias", 0, "url"]}
                            rules={[
                              {
                                required: true,
                                message: "Video file is required!",
                              },
                            ]}
                            className="!mb-0"
                          >
                            <CustomUploader
                              listType="picture-card"
                              maxCount={1}
                              innerContent="Video"
                              acceptedTypes={["mp4", "webm"]}
                              initialValues={
                                initialValues?.medias?.[0]?.url
                                  ? [initialValues?.medias?.[0]?.url]
                                  : []
                              }
                              onChange={(urls, dataObjects) => {
                                form.setFieldValue(
                                  ["medias", 0, "url"],
                                  urls[0] || null,
                                );
                                if (dataObjects?.[0]?.key) {
                                  form.setFieldValue(
                                    ["medias", 0, "key"],
                                    dataObjects[0].key,
                                  );
                                }
                              }}
                            />
                          </Form.Item>
                        ) : source === "youtube" ? (
                          <Form.Item
                            name={["medias", 0, "url"]}
                            rules={[
                              {
                                required: true,
                                message: "YouTube URL is required!",
                              },
                            ]}
                            className="!mb-0"
                          >
                            <FloatInput placeholder="YouTube Video URL" />
                          </Form.Item>
                        ) : null;
                      }}
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name={["medias", 0, "caption"]}
                      className="!mb-0"
                    >
                      <FloatTextarea
                        placeholder="Video Caption (Optional)"
                        autoSize={{ maxRows: 2 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.medias?.[0]?.source !==
                        currentValues.medias?.[0]?.source
                      }
                    >
                      {({ getFieldValue }) => {
                        const source = getFieldValue(["medias", 0, "source"]);
                        return source === "do-space" ? (
                          <Form.Item
                            name="coverImage"
                            className="!mb-0"
                            label="Cover Image (Thumbnail)"
                          >
                            <CustomUploader
                              listType="picture-card"
                              initialValues={
                                initialValues?.coverImage
                                  ? [initialValues?.coverImage]
                                  : []
                              }
                              onChange={(urls) =>
                                form.setFieldValue(
                                  "coverImage",
                                  urls[0] || null,
                                )
                              }
                            />
                          </Form.Item>
                        ) : null;
                      }}
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}

          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item name="authorId" className="!mb-0">
                <InfiniteScrollSelect<IAuthor>
                  isFloat
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Select existing author"
                  initialOptions={
                    authorQuery.data?.data?.id ? [authorQuery.data?.data] : []
                  }
                  option={({ item: author }) => ({
                    key: author?.id,
                    label: `${author?.name} (${author?.nameBn})`,
                    value: author?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) =>
                    setAuthorSearchTerm(searchTerm)
                  }
                  query={authorsQuery}
                />
              </Form.Item>
              <Form.Item
                name="authorName"
                className="!mb-0 !mt-2"
                dependencies={["authorId"]}
              >
                <FloatInput placeholder="Or type a new author name to auto-create" />
              </Form.Item>
            </Col>
          )}
          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={12}>
              <Form.Item name="tags" className="!mb-0">
                <TagSelector placeholder="Select or create tags..." />
              </Form.Item>
            </Col>
          )}

          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={8}>
              <Form.Item name="leadType" className="!mb-0">
                <Radio.Group buttonStyle="solid" className="w-full text-center">
                  <Radio.Button className="w-1/3" value="lead">
                    Lead
                  </Radio.Button>
                  <Radio.Button className="w-1/3" value="second-lead">
                    2nd Lead
                  </Radio.Button>
                  <Radio.Button className="w-1/3" value="non-lead">
                    Non Lead
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          )}
          {currentType !== "video" && currentType !== "photo" && (
            <Col xs={24} sm={8}>
              <Form.Item name="isFeatured" className="!mb-0">
                <Radio.Group buttonStyle="solid" className="w-full text-center">
                  <Radio.Button className="w-1/2" value={true}>
                    Featured
                  </Radio.Button>
                  <Radio.Button className="w-1/2" value={false}>
                    Non Featured
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          )}
          <Col
            xs={24}
            sm={currentType === "video" || currentType === "photo" ? 24 : 8}
          >
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

          {currentType === "photo" && (
            <Col xs={24}>
              <Card title="Photo Media" className="mb-4">
                <Form.List name="medias">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                          No photos added yet.
                        </div>
                      )}
                      {fields.map(({ key, name }) => (
                        <div
                          key={key}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4"
                        >
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                name={[name, "url"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Photo is required!",
                                  },
                                ]}
                                className="!mb-0"
                              >
                                <CustomUploader
                                  listType="picture-card"
                                  maxCount={1}
                                  innerContent="Photo"
                                  acceptedTypes={["jpg", "jpeg", "png", "webp"]}
                                  initialValues={photoMediaInitialValues[name]}
                                  onChange={(urls, dataObjects) => {
                                    form.setFieldValue(
                                      ["medias", name, "url"],
                                      urls[0] || null,
                                    );
                                    form.setFieldValue(
                                      ["medias", name, "source"],
                                      "do-space",
                                    );
                                    if (dataObjects?.[0]?.key) {
                                      form.setFieldValue(
                                        ["medias", name, "key"],
                                        dataObjects[0].key,
                                      );
                                    }
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={10}>
                              <Form.Item name={[name, "source"]} hidden>
                                <input />
                              </Form.Item>
                              <Form.Item
                                name={[name, "caption"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Caption is required!",
                                  },
                                ]}
                                className="!mb-0"
                              >
                                <FloatTextarea
                                  id={`photo-caption-${name}`}
                                  placeholder="Photo Caption"
                                  autoSize={{ maxRows: 2 }}
                                />
                              </Form.Item>
                            </Col>
                            <Col
                              xs={24}
                              sm={2}
                              className="flex items-center justify-center"
                            >
                              <Button
                                type="text"
                                danger
                                icon={<AiOutlineDelete />}
                                onClick={() => remove(name)}
                              />
                            </Col>
                          </Row>
                        </div>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() =>
                          add({ url: null, caption: "", source: "do-space" })
                        }
                        block
                        icon={<AiOutlinePlus />}
                      >
                        {fields.length === 0
                          ? "Add Photo"
                          : "Add Another Photo"}
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>
            </Col>
          )}

          {currentType === "video" && (
            <>
              <Col xs={24}>
                <Form.Item name="excerpt" className="!mb-0">
                  <FloatTextarea
                    placeholder="Excerpt (Optional)"
                    autoSize={{ maxRows: 3 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="metaDescription" className="!mb-0">
                  <FloatTextarea
                    placeholder="Meta Description (Optional)"
                    autoSize={{ maxRows: 3 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="categoryIds" className="!mb-0">
                  <InfiniteScrollSelect<ICategory>
                    isFloat
                    allowClear
                    showSearch
                    virtual={false}
                    mode="multiple"
                    placeholder="Category (Optional)"
                    initialOptions={initialValues?.categories || []}
                    option={({ item: category }) => ({
                      key: category?.id,
                      label: `${category?.title} (${category?.titleBn})`,
                      value: category?.id,
                    })}
                    onChangeSearchTerm={(searchTerm) =>
                      setCategorySearchTerm(searchTerm)
                    }
                    query={categoriesQuery}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="subCategoryIds" className="!mb-0">
                  <InfiniteScrollSelect<ISubCategory>
                    isFloat
                    allowClear
                    showSearch
                    virtual={false}
                    mode="multiple"
                    placeholder="Sub Category (Optional)"
                    initialOptions={initialValues?.subCategories || []}
                    option={({ item: subCategory }) => ({
                      key: subCategory?.id,
                      label: subCategory?.title,
                      value: subCategory?.id,
                    })}
                    onChangeSearchTerm={(searchTerm) =>
                      setSubCategorySearchTerm(searchTerm)
                    }
                    query={subCategoriesQuery}
                    disabled={!effectiveCategoryIds.length}
                  />
                </Form.Item>
              </Col>
            </>
          )}

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

export default ArticlesForm;
