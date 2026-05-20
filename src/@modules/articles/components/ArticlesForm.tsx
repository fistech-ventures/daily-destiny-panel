import FloatDatePicker from '@base/antd/components/FloatDatePicker';
import FloatFormList from '@base/antd/components/FloatFormList';
import FloatInput from '@base/antd/components/FloatInput';
import FloatSelect from '@base/antd/components/FloatSelect';
import FloatTextarea from '@base/antd/components/FloatTextarea';
import CustomUploader from '@base/components/CustomUploader';
import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import RichTextEditor from '@base/components/RichTextEditor';
import TagSelector from '@base/components/TagSelector';
import { Toolbox } from '@lib/utils';
import { AuthorsHooks } from '@modules/authors/lib/hooks';
import { IAuthor } from '@modules/authors/lib/interfaces';
import { CategoriesHooks } from '@modules/categories/lib/hooks';
import { ICategory } from '@modules/categories/lib/interfaces';
import { SubCategoriesHooks } from '@modules/sub-categories/lib/hooks';
import { ISubCategory } from '@modules/sub-categories/lib/interfaces';
import { Button, Card, Col, Form, FormInstance, Radio, Row, Select, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { AiOutlineDelete, AiOutlinePlus } from 'react-icons/ai';
import { IoCalendar } from 'react-icons/io5';
import { IArticleCreate } from '../lib/interfaces';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IArticleCreate>;
  onFinish: (values: IArticleCreate) => void;
  shouldReset?: boolean;
}

const ArticlesForm: React.FC<IProps> = ({
  isLoading,
  form,
  formType = 'create',
  initialValues,
  onFinish,
  shouldReset,
}) => {
  const [activeLang, setActiveLang] = useState<'en' | 'bn'>('bn');
  const formValues = Form.useWatch([], form);
  const [categorySearchTerm, setCategorySearchTerm] = useState(null);
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState(null);
  const [authorSearchTerm, setAuthorSearchTerm] = useState(null);

  const getFileMeta = (url: string) => {
    if (!url) return { extension: '', mimetype: '' };
    const extension = url.split('.').pop()?.toLowerCase();
    let mimetype = '';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
      mimetype = `image/${extension}`;
    } else if (['mp4', 'webm', 'ogg'].includes(extension || '')) {
      mimetype = `video/${extension}`;
    }
    return { extension: extension ? `.${extension}` : '', mimetype };
  };

  const extractVideoKey = (url: string, source: string) => {
    try {
      if (!url) return '';
      if (source === 'youtube') {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) return urlObj.searchParams.get('v') || '';
        if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.slice(1);
      }
      if (source === 'facebook') {
        const urlObj = new URL(url);

        // Pattern 1: ?v=VIDEO_ID
        if (urlObj.searchParams.has('v')) return urlObj.searchParams.get('v') || '';

        const paths = urlObj.pathname.split('/').filter(Boolean);

        // Pattern 2: /videos/VIDEO_ID/
        if (paths.includes('videos')) return paths[paths.indexOf('videos') + 1] || '';

        // Pattern 3: /share/v/VIDEO_ID/
        if (paths.includes('share') && paths.includes('v')) return paths[paths.indexOf('v') + 1] || '';

        // Pattern 4: /reel/VIDEO_ID/
        if (paths.includes('reel')) return paths[paths.indexOf('reel') + 1] || '';
      }
    } catch (e) {
      console.error(e);
      return '';
    }
    return '';
  };

  const handleFinishFn = (values) => {
    values.language = activeLang === 'en' ? 'English' : 'Bengali';

    if (values.medias?.length) {
      values.medias = values.medias.map((media) => {
        const meta = getFileMeta(media.url || '');
        let mimetype = media.mimetype || meta.mimetype;
        let extension = media.extension || meta.extension;

        if (!mimetype) {
          if (media.source === 'youtube' || media.source === 'facebook') {
            mimetype = 'video/mp4';
            extension = '.mp4';
          } else {
            mimetype = 'image/jpeg';
            extension = '.jpg';
          }
        }

        let key = media.key || '';
        if (!key && (media.source === 'youtube' || media.source === 'facebook')) {
          key = extractVideoKey(media.url || '', media.source);
        }

        return {
          title: media.title,
          caption: media.caption,
          credit: media.credit,
          altText: media.altText,
          url: media.url,
          source: media.source,
          mimetype,
          extension,
          key,
        };
      });
    }
    // TagSelector already returns an array, so no need to split
    if (values.tags && typeof values.tags === 'string') {
      // Handle legacy string format for backward compatibility
      values.tags = values.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter(Boolean);
    }

    onFinish(values);
  };

  const categoryQuery = CategoriesHooks.useFindById({
    id: formValues?.categoryId,
    config: {
      queryKey: [],
      enabled: !!formValues?.categoryId,
    },
  });

  const categoriesQuery = CategoriesHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: categorySearchTerm,
      isActive: 'true',
    },
  });

  const subCategoryQuery = SubCategoriesHooks.useFindById({
    id: formValues?.subCategoryId,
    config: {
      queryKey: [],
      enabled: !!formValues?.subCategoryId,
    },
  });

  const subCategoriesQuery = SubCategoriesHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: subCategorySearchTerm,
      isActive: 'true',
      categoryId: formValues?.categoryId || undefined,
    },
  });

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
    if (formType === 'update') {
      setActiveLang(initialValues?.language === 'Bengali' ? 'bn' : 'en');
    }
  }, [formType, form, initialValues]);

  useEffect(() => {
    if (shouldReset) {
      form.resetFields();
    }
  }, [shouldReset, form]);

  // Reset position to 0 when article is changed from featured to non-featured or exclusive to non-exclusive
  useEffect(() => {
    if (formType === 'update' && initialValues) {
      const currentValues = form.getFieldsValue();
      
      // Check if isFeatured changed from true to false
      if (initialValues.isFeatured === true && currentValues.isFeatured === false) {
        form.setFieldValue('position', 0);
      }
      
      // Check if isExclusive changed from true to false  
      if (initialValues.isExclusive === true && currentValues.isExclusive === false) {
        form.setFieldValue('position', 0);
      }
    }
  }, [formValues?.isFeatured, formValues?.isExclusive, formType, initialValues, form]);

  return (
    <React.Fragment>
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={{
          ...initialValues,
          metaTitle: initialValues?.metaTitle || initialValues?.seoMetaData?.title || initialValues?.title,
          metaDescription:
            initialValues?.metaDescription || initialValues?.seoMetaData?.description || initialValues?.excerpt,
          date: initialValues?.date ? dayjs(initialValues?.date) : dayjs(),
        }}
        onFinish={handleFinishFn}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item className="!mb-0">
              <Space>
                <Button type={activeLang === 'bn' ? 'primary' : 'default'} onClick={() => setActiveLang('bn')}>
                  বাংলা
                </Button>
                {/* <Button type={activeLang === 'en' ? 'primary' : 'default'} onClick={() => setActiveLang('en')}>
                  English
                </Button> */}
              </Space>
            </Form.Item>
            <Form.Item name="position" initialValue={0} className="!mb-0 !mt-3">
              <FloatInput placeholder="Position" type="number" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="coverImage"
              rules={[{ required: true, message: 'Cover image is required!' }]}
              className="!mb-0"
            >
              <CustomUploader
                listType="picture-card"
                initialValues={[formValues?.coverImage]}
                onChange={(urls) => form.setFieldValue('coverImage', urls[0] || null)}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="type" rules={[{ required: true, message: 'Type is required!' }]} className="!mb-0">
              <FloatSelect
                placeholder="Type"
                options={[
                  { value: 'news', label: 'News' },
                  { value: 'series', label: 'Series' },
                  { value: 'stories', label: 'Stories' },
                  { value: 'photo', label: 'Photo' },
                  { value: 'video', label: 'Video' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="coverImageCredit"
              rules={[{ required: true, message: 'Cover image credit is required' }]}
              className="!mb-0"
            >
              <FloatInput placeholder="Cover Image Credit" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput
                placeholder="Title"
                onKeyUp={(e) => {
                  const val = (e.target as HTMLInputElement).value;
                  form.setFieldValue('slug', Toolbox.generateSlug(val, '-', false));
                  form.setFieldValue('metaTitle', val);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="metaTitle"
              rules={[{ required: true, message: 'Meta title is required!' }]}
              className="!mb-0"
            >
              <FloatInput placeholder="Meta Title" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="excerpt" rules={[{ required: true, message: 'Excerpt is required!' }]} className="!mb-0">
              <FloatTextarea
                placeholder="Excerpt"
                autoSize={{ maxRows: 3 }}
                onKeyUp={(e) => {
                  const val = (e.target as HTMLTextAreaElement).value;
                  form.setFieldValue('metaDescription', val);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="metaDescription"
              rules={[{ required: true, message: 'Meta description is required!' }]}
              className="!mb-0"
            >
              <FloatTextarea placeholder="Meta Description" autoSize={{ maxRows: 3 }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="date" rules={[{ required: true, message: 'Date is required!' }]} className="!mb-0">
              <FloatDatePicker
                showTime
                placeholder="Date (Defaults to now)"
                format="YYYY-MM-DD hh:mm A"
                suffixIcon={<IoCalendar />}
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="slug" rules={[{ required: true, message: 'Slug is required!' }]} className="!mb-0">
              <FloatInput placeholder="Slug" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="categoryId"
              rules={[{ required: true, message: 'Category is required!' }]}
              className="!mb-0"
            >
              <InfiniteScrollSelect<ICategory>
                isFloat
                allowClear
                showSearch
                virtual={false}
                placeholder="Category"
                initialOptions={categoryQuery.data?.data?.id ? [categoryQuery.data?.data] : []}
                option={({ item: category }) => ({
                  key: category?.id,
                  label: category?.title,
                  value: category?.id,
                })}
                onChangeSearchTerm={(searchTerm) => setCategorySearchTerm(searchTerm)}
                query={categoriesQuery}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="subCategoryId" className="!mb-0" rules={[{ required: false }]}>
              <InfiniteScrollSelect<ISubCategory>
                isFloat
                allowClear
                showSearch
                virtual={false}
                placeholder="Sub Category"
                initialOptions={subCategoryQuery.data?.data?.id ? [subCategoryQuery.data?.data] : []}
                option={({ item: subCategory }) => ({
                  key: subCategory?.id,
                  label: subCategory?.title,
                  value: subCategory?.id,
                })}
                onChangeSearchTerm={(searchTerm) => setSubCategorySearchTerm(searchTerm)}
                query={subCategoriesQuery}
                disabled={!formValues?.categoryId}
              />
            </Form.Item>
          </Col>

          {['news', 'series', 'stories'].includes(formValues?.type) && (
            <Col xs={24}>
              <Form.Item name="details" rules={[{ required: true, message: 'Content is required!' }]} className="!mb-0">
                <RichTextEditor placeholder="Content" />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} sm={12}>
            <Form.Item name="authorId" rules={[{ required: true, message: 'Author is required!' }]} className="!mb-0">
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
          <Col xs={24} sm={12}>
            <Form.Item name="tags" className="!mb-0">
              <TagSelector placeholder="Select or create tags..." />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item name="isExclusive" className="!mb-0">
              <Radio.Group buttonStyle="solid" className="w-full text-center">
                <Radio.Button className="w-1/2" value={true}>
                  Exclusive
                </Radio.Button>
                <Radio.Button className="w-1/2" value={false}>
                  Non Exclusive
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
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
          <Col xs={24} sm={8}>
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

          {['photo', 'video'].includes(formValues?.type) && (
            <Col xs={24}>
              <FloatFormList name="medias">
                {(fields, { add, remove }) => (
                  <div className="flex flex-col gap-4">
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        size="small"
                        title={`Media ${name + 1}`}
                        extra={<Button type="text" danger icon={<AiOutlineDelete />} onClick={() => remove(name)} />}
                      >
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              {...restField}
                              rules={[{ required: true, message: 'Title is required!' }]}
                              name={[name, 'title']}
                              className="!mb-0"
                            >
                              <FloatInput placeholder="Title" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              {...restField}
                              rules={[{ required: true, message: 'Caption is required!' }]}
                              name={[name, 'caption']}
                              className="!mb-0"
                            >
                              <FloatInput placeholder="Caption" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'credit']}
                              className="!mb-0"
                              rules={[{ required: true, message: 'Credit is required!' }]}
                            >
                              <FloatInput placeholder="Credit" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item {...restField} name={[name, 'altText']} className="!mb-0">
                              <FloatInput placeholder="Alt Text" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              {...restField}
                              name={[name, 'source']}
                              className="!mb-0"
                              rules={[{ required: true, message: 'Source is required!' }]}
                            >
                              <Select
                                placeholder="Select Source"
                                className="w-full"
                                options={[
                                  { value: 'youtube', label: 'YouTube' },
                                  { value: 'facebook', label: 'Facebook' },
                                  { value: 'do-space', label: 'Upload' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            {formValues?.medias?.[name]?.source === 'do-space' ? (
                              <Form.Item
                                {...restField}
                                name={[name, 'url']}
                                className="!mb-0"
                                rules={[{ required: true, message: 'Media file is required!' }]}
                              >
                                <CustomUploader
                                  listType="picture-card"
                                  maxCount={1}
                                  innerContent="Image/Video"
                                  acceptedTypes={['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm']}
                                  initialValues={
                                    formValues?.medias?.[name]?.url ? [formValues?.medias?.[name]?.url] : []
                                  }
                                  onChange={(urls, dataObjects) => {
                                    form.setFieldValue(['medias', name, 'url'], urls[0] || null);
                                    if (dataObjects?.[0]?.key) {
                                      form.setFieldValue(['medias', name, 'key'], dataObjects[0].key);
                                    }
                                  }}
                                />
                              </Form.Item>
                            ) : formValues?.medias?.[name]?.source ? (
                              <Form.Item
                                {...restField}
                                name={[name, 'url']}
                                className="!mb-0"
                                rules={[{ required: true, message: 'URL is required!' }]}
                              >
                                <FloatInput placeholder="Video URL" />
                              </Form.Item>
                            ) : null}
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<AiOutlinePlus />}>
                      Add Media
                    </Button>
                  </div>
                )}
              </FloatFormList>
            </Col>
          )}

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

export default ArticlesForm;
