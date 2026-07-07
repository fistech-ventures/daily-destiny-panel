import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import { Toolbox } from '@lib/utils';
import { AuthorsHooks } from '@modules/authors/lib/hooks';
import { IAuthor } from '@modules/authors/lib/interfaces';
import { CategoriesHooks } from '@modules/categories/lib/hooks';
import { ICategory } from '@modules/categories/lib/interfaces';
import { LocationsHooks } from '@modules/locations/lib/hooks';
import { ILocation } from '@modules/locations/lib/interfaces';
import { SubCategoriesHooks } from '@modules/sub-categories/lib/hooks';
import { ISubCategory } from '@modules/sub-categories/lib/interfaces';
import { UsersHooks } from '@modules/users/lib/hooks';
import { IUser } from '@modules/users/lib/interfaces';
import { Button, DatePicker, Drawer, Form, Radio, Select, Space, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';
import { ENUM_ARTICLES_STATUS_TYPES } from '../lib/enums';
import { IArticlesFilter } from '../lib/interfaces';

interface IProps {
  initialValues: IArticlesFilter;
  onChange: (values: IArticlesFilter) => void;
}

const ArticlesFilter: React.FC<IProps> = ({ initialValues, onChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const [categorySearchTerm, setCategorySearchTerm] = useState<string | null>(null);
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState<string | null>(null);
  const watchedCategoryIds = Form.useWatch('categoryIds', formInstance);
  const watchedCategoryId = Form.useWatch('categoryId', formInstance);
  const effectiveCategoryIds = [...(watchedCategoryIds ?? []), ...(watchedCategoryId ? [watchedCategoryId] : [])];
  const [authorSearchTerm, setAuthorSearchTerm] = useState<string | null>(null);
  const [createdByUserSearchTerm, setCreatedByUserSearchTerm] = useState<string | null>(null);
  const [updatedByUserSearchTerm, setUpdatedByUserSearchTerm] = useState<string | null>(null);
  const [publishedByUserSearchTerm, setPublishedByUserSearchTerm] = useState<string | null>(null);
  const [divisionSearchTerm, setDivisionSearchTerm] = useState<string | null>(null);
  const [districtSearchTerm, setDistrictSearchTerm] = useState<string | null>(null);
  const [upazillaSearchTerm, setUpazillaSearchTerm] = useState<string | null>(null);
  const divisionId = Form.useWatch('divisionId', formInstance);
  const districtId = Form.useWatch('districtId', formInstance);

  const categoriesQuery = CategoriesHooks.useFindInfinite({
    options: { limit: 20, searchTerm: categorySearchTerm, isActive: 'true' },
  });

  const subCategoriesQuery = SubCategoriesHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: subCategorySearchTerm,
      isActive: 'true',
      categoryId: effectiveCategoryIds.length === 1 ? String(effectiveCategoryIds[0]) : undefined,
      categoryIds: effectiveCategoryIds.length > 1 ? effectiveCategoryIds.map(String) : undefined,
    },
  });

  const authorsQuery = AuthorsHooks.useFindInfinite({
    options: { limit: 20, searchTerm: authorSearchTerm, isActive: 'true' },
  });

  const createdByUsersQuery = UsersHooks.useFindInfinite({
    options: { limit: 20, searchTerm: createdByUserSearchTerm, isActive: 'true' },
  });

  const updatedByUsersQuery = UsersHooks.useFindInfinite({
    options: { limit: 20, searchTerm: updatedByUserSearchTerm, isActive: 'true' },
  });

  const publishedByUsersQuery = UsersHooks.useFindInfinite({
    options: { limit: 20, searchTerm: publishedByUserSearchTerm, isActive: 'true' },
  });

  const divisionsQuery = LocationsHooks.useFindInfinite({
    options: { limit: 20, searchTerm: divisionSearchTerm, isActive: 'true', type: 'division' },
  });

  const districtsQuery = LocationsHooks.useFindInfinite({
    options: { limit: 20, searchTerm: districtSearchTerm, isActive: 'true', type: 'district', parentId: divisionId || undefined },
  });

  const upazillasQuery = LocationsHooks.useFindInfinite({
    options: { limit: 20, searchTerm: upazillaSearchTerm, isActive: 'true', type: 'upazilla', parentId: districtId || undefined },
  });

  useEffect(() => {
    formInstance.resetFields();

    const values = {
      isActive: '',
      sortOrder: '',
      type: '',
      status: '',
      categoryId: undefined,
      categoryIds: undefined,
      subCategoryId: undefined,
      subCategoryIds: undefined,
      authorId: undefined,
      createdById: undefined,
      updatedById: undefined,
      publishedById: undefined,
      locationId: undefined,
      divisionId: undefined,
      districtId: undefined,
      upazillaId: undefined,
      dateRange: [],
      ...initialValues,
    };

    if (values?.startDate && values?.endDate) {
      values.dateRange.push(dayjs(values.startDate));
      values.dateRange.push(dayjs(values.endDate));

      delete values.startDate;
      delete values.endDate;
    }

    formInstance.setFieldsValue(values);
  }, [formInstance, initialValues]);

  return (
    <div className="flex flex-wrap gap-3 justify-end mb-4">
      <Button type="primary" icon={<FaFilter />} onClick={() => setDrawerOpen(true)} ghost>
        Filter
      </Button>
      <Drawer width={540} title="Filter Articles" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <Form
          form={formInstance}
          layout="vertical"
          onFinish={Toolbox.debounce((values) => {
            values.startDate = values?.dateRange?.length
              ? dayjs(values?.dateRange?.[0]).startOf('day').toISOString()
              : null;
            values.endDate = values?.dateRange?.length
              ? dayjs(values?.dateRange?.[1]).endOf('day').toISOString()
              : null;

            delete values.dateRange;
            onChange(values);
            setDrawerOpen(false);
          }, 1000)}
          className="flex flex-col gap-3"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="dateRange" label="Date Range" className="!mb-0">
                <DatePicker.RangePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={14}>
              <Form.Item name="isActive" label="Active Status" className="!mb-0">
                <Radio.Group buttonStyle="solid" className="w-full text-center">
                  <Radio.Button className="w-1/3" value="">All</Radio.Button>
                  <Radio.Button className="w-1/3" value="true">Active</Radio.Button>
                  <Radio.Button className="w-1/3" value="false">Inactive</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item name="status" label="Article Status" className="!mb-0">
                <Select
                  placeholder="Select Status"
                  allowClear
                  options={[
                    { value: ENUM_ARTICLES_STATUS_TYPES.Published, label: 'Published' },
                    { value: ENUM_ARTICLES_STATUS_TYPES.Drafted, label: 'Drafted' },
                    { value: ENUM_ARTICLES_STATUS_TYPES.Archived, label: 'Archived' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="type" label="Type" className="!mb-0">
                <Select
                  placeholder="Select Type"
                  allowClear
                  options={[
                    {value: 'news', label: 'News' },
                    {value: 'series', label: 'Series' },
                    {value: 'stories', label: 'Stories' },
                    { value: 'photo', label: 'Photo' },
                    { value: 'video', label: 'Video' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="sortOrder" label="Sort Order" className="!mb-0">
                <Radio.Group buttonStyle="solid" className="w-full text-center">
                  <Radio.Button className="w-1/2" value="">ASC</Radio.Button>
                  <Radio.Button className="w-1/2" value="DESC">DESC</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="categoryIds" label="Categories" className="!mb-0">
                <InfiniteScrollSelect<ICategory>
                  allowClear
                  showSearch
                  virtual={false}
                  mode="multiple"
                  placeholder="Filter by Categories"
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

            <Col span={24}>
              <Form.Item name="subCategoryIds" label="Sub Categories" className="!mb-0">
                <InfiniteScrollSelect<ISubCategory>
                  allowClear
                  showSearch
                  virtual={false}
                  mode="multiple"
                  placeholder="Filter by Sub Categories"
                  option={({ item: subCategory }) => ({
                    key: subCategory?.id,
                    label: subCategory?.title,
                    value: subCategory?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setSubCategorySearchTerm(searchTerm)}
                  query={subCategoriesQuery}
                  disabled={!effectiveCategoryIds.length}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="authorId" label="Author" className="!mb-0">
                <InfiniteScrollSelect<IAuthor>
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Filter by Author"
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

            <Col span={24}>
              <Form.Item name="createdById" label="Created By" className="!mb-0">
                <InfiniteScrollSelect<IUser>
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Filter by Creator"
                  option={({ item: user }) => ({
                    key: user?.id,
                    label: user?.fullName || user?.username,
                    value: user?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setCreatedByUserSearchTerm(searchTerm)}
                  query={createdByUsersQuery}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="updatedById" label="Updated By" className="!mb-0">
                <InfiniteScrollSelect<IUser>
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Filter by Updater"
                  option={({ item: user }) => ({
                    key: user?.id,
                    label: user?.fullName || user?.username,
                    value: user?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setUpdatedByUserSearchTerm(searchTerm)}
                  query={updatedByUsersQuery}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="publishedById" label="Published By" className="!mb-0">
                <InfiniteScrollSelect<IUser>
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Filter by Publisher"
                  option={({ item: user }) => ({
                    key: user?.id,
                    label: user?.fullName || user?.username,
                    value: user?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setPublishedByUserSearchTerm(searchTerm)}
                  query={publishedByUsersQuery}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="divisionId" label="Division" className="!mb-0">
                <InfiniteScrollSelect<ILocation>
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Filter by Division"
                  option={({ item: location }) => ({
                    key: location?.id,
                    label: `${location?.name} (${location?.nameBn})`,
                    value: location?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setDivisionSearchTerm(searchTerm)}
                  query={divisionsQuery}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="districtId" label="District" className="!mb-0">
                <InfiniteScrollSelect<ILocation>
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Filter by District"
                  option={({ item: location }) => ({
                    key: location?.id,
                    label: `${location?.name} (${location?.nameBn})`,
                    value: location?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setDistrictSearchTerm(searchTerm)}
                  query={districtsQuery}
                  disabled={!divisionId}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="upazillaId" label="Upazilla" className="!mb-0">
                <InfiniteScrollSelect<ILocation>
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Filter by Upazilla"
                  option={({ item: location }) => ({
                    key: location?.id,
                    label: `${location?.name} (${location?.nameBn})`,
                    value: location?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setUpazillaSearchTerm(searchTerm)}
                  query={upazillasQuery}
                  disabled={!districtId}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item className="!mb-0 mt-4 text-right">
                <Space.Compact>
                  <Button type="primary" htmlType="submit">
                    Apply Filters
                  </Button>
                  <Button
                    type="primary"
                    icon={<MdClear />}
                    onClick={() => {
                      setDrawerOpen(false);
                      formInstance.resetFields();

                      const params = Toolbox.toCleanObject({
                        ...Object.fromEntries(searchParams.entries()),
                        ...formInstance.getFieldsValue(),
                        startDate: null,
                        endDate: null,
                      });
                      const queryString = new URLSearchParams(params).toString();

                      router.push(`?${queryString}`);
                    }}
                    danger
                    ghost
                  >
                    Clear All
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default ArticlesFilter;
