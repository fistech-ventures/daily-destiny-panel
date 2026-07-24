import FloatInput from '@base/antd/components/FloatInput';
import CustomUploader from '@base/components/CustomUploader';
import { ArticlesHooks } from '@modules/articles/lib/hooks';
import { IArticle } from '@modules/articles/lib/interfaces';
import { ISpecialEventCreate, ISpecialEvent } from '@modules/special-events/lib/interfaces';
import { Button, Col, Form, FormInstance, Row, Select, Space, Tag, Avatar, message, Typography, Image } from 'antd';
import React, { useState, useEffect } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<ISpecialEvent & { articleIds?: string[] }>;
  onFinish: (values: ISpecialEventCreate) => void;
  backendError?: string | null;
}

const SpecialEventsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish, backendError }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [articleSearchTerm, setArticleSearchTerm] = useState('');

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

  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  // Articles search query
  const articlesQuery = ArticlesHooks.useFind({
    options: {
      limit: 50,
      searchTerm: articleSearchTerm,
      isActive: 'true',
    },
    config: {
      queryKey: [],
      enabled: true,
    },
  });

  // Generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const currentSlug = form.getFieldValue('slug');
    // Only auto-generate slug if slug field is empty or was auto-generated before
    if (!currentSlug || formType === 'create') {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setFieldValue('slug', slug);
    }
  };

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
          isActive: initialValues?.isActive ?? true,
          articleIds: initialValues?.articleIds || initialValues?.articles?.map((a: IArticle) => a.id) || [],
        }}
        onFinish={onFinish}
        onFinishFailed={handleFinishFailed}
        validateMessages={{
          required: '${label} is required!',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="title" rules={[{ required: true, message: 'Title is required!' }]} className="!mb-0">
              <FloatInput placeholder="Event Title" onChange={handleTitleChange} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="slug" className="!mb-0">
              <FloatInput placeholder="Slug (auto-generated from title)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="bannerImage" className="!mb-0">
              <CustomUploader
                listType="picture-card"
                maxCount={1}
                acceptedTypes={['jpg', 'jpeg', 'png', 'webp']}
                initialValues={initialValues?.bannerImage ? [initialValues.bannerImage] : []}
                onChange={(urls) => {
                  if (urls.length > 0) {
                    form.setFieldValue('bannerImage', urls[0]);
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="isActive" label="Status" className="!mb-0">
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="articleIds" label="Articles" className="!mb-0">
              <Select
                mode="multiple"
                placeholder="Search and select articles..."
                showSearch
                filterOption={false}
                onSearch={setArticleSearchTerm}
                loading={articlesQuery.isLoading}
                notFoundContent={null}
                optionRender={(option) => {
                  const article = option.data as any;
                  return (
                    <Space size={8}>
                      <Avatar
                        src={article.coverImage}
                        shape="square"
                        size={32}
                        icon={!article.coverImage && <AiOutlineSearch />}
                      />
                      <div>
                        <Typography.Text style={{ fontSize: 13 }} ellipsis={{ tooltip: article.title }}>
                          {article.title}
                        </Typography.Text>
                        <br />
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                          {article.categories?.length ? article.categories.map((c: any) => c?.title || c?.titleBn).join(', ') : (article.category?.title || '')} {article.author?.name ? `- ${article.author.name}` : ''}
                        </Typography.Text>
                      </div>
                    </Space>
                  );
                }}
                options={articlesQuery.data?.data?.map((article: IArticle) => ({
                  label: article.title,
                  value: article.id,
                  coverImage: article.coverImage,
                  title: article.title,
                  category: article.category,
                  author: article.author,
                })) || []}
                tagRender={(props) => {
                  const { label, closable, onClose } = props;
                  const article = articlesQuery.data?.data?.find((a: IArticle) => a.id === props.value);
                  return (
                    <Tag
                      color="blue"
                      closable={closable}
                      onClose={onClose}
                      style={{ marginRight: 3, marginBottom: 2, padding: '2px 4px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {article?.coverImage && (
                        <Image
                          src={article.coverImage}
                          width={20}
                          height={20}
                          style={{ objectFit: 'cover', borderRadius: 2 }}
                          preview={false}
                        />
                      )}
                      {label}
                    </Tag>
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item className="text-right !mb-0">
              <Button loading={isLoading} type="primary" htmlType="submit">
                {formType === 'create' ? 'Create Event' : 'Update Event'}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default SpecialEventsForm;
