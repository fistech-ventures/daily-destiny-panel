import FloatInput from '@base/antd/components/FloatInput';
import FloatSelect from '@base/antd/components/FloatSelect';
import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import { LocationsHooks } from '@modules/locations/lib/hooks';
import { ILocation, ILocationCreate } from '@modules/locations/lib/interfaces';
import { Button, Col, Form, FormInstance, Radio, Row } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<ILocationCreate>;
  onFinish: (values: ILocationCreate) => void;
}

const locationTypes = [
  { label: 'Country', value: 'country' },
  { label: 'Division', value: 'division' },
  { label: 'District', value: 'district' },
  { label: 'Upazilla', value: 'upazilla' },
  { label: 'Union', value: 'union' },
  { label: 'City Corporation', value: 'city_corporation' },
  { label: 'Pourashava', value: 'pourosova' },
];

// Mapping of location type to its parent type
const locationTypeToParentType: Record<string, string> = {
  division: 'country',
  district: 'division',
  upazilla: 'district',
  union: 'upazilla',
  city_corporation: 'district',
  pourosova: 'upazilla',
};

const LocationsForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish }) => {
  const [locationSearchTerm, setLocationSearchTerm] = useState<string | null>(null);
  const formValues = Form.useWatch([], form);

  // Get the parent type based on selected location type
  const parentType = formValues?.type ? locationTypeToParentType[formValues.type] : null;

  const parentQuery = LocationsHooks.useFindById({
    id: formValues?.parentId,
    config: {
      queryKey: ['location', formValues?.parentId],
      enabled: !!formValues?.parentId,
    },
  });

  const parentLocationsQuery = LocationsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: locationSearchTerm,
      isActive: 'true',
      type: parentType,
    },
    config: {
      queryKey: ['parent-locations', parentType, locationSearchTerm],
      enabled: !!parentType,
    },
  });

  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  // Clear parentId when type changes to avoid invalid parent references
  useEffect(() => {
    if (formValues?.type && !locationTypeToParentType[formValues.type]) {
      form.setFieldValue('parentId', undefined);
    }
  }, [formValues?.type, form]);

  return (
    <React.Fragment>
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={{
          ...initialValues,
          type: initialValues?.type,
          isActive: initialValues?.isActive,
        }}
        onFinish={onFinish}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item name="name" rules={[{ required: true, message: 'Name is required!' }]} className="!mb-0">
              <FloatInput placeholder="Location Name" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="nameBn" rules={[{ required: true, message: 'Location name (Bangla) is required!' }]} className="!mb-0">
              <FloatInput placeholder="Location Name (Bangla)" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="slug" rules={[{ required: true, message: 'Slug is required!' }]} className="!mb-0">
              <FloatInput placeholder="Slug" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="type" rules={[{ required: true, message: 'Type is required!' }]} className="!mb-0">
              <FloatSelect placeholder="Type" options={locationTypes} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="parentId" className="!mb-0">
              <InfiniteScrollSelect<ILocation>
                isFloat
                allowClear
                showSearch
                virtual={false}
                placeholder="Parent Location"
                initialOptions={parentQuery.data?.data?.id ? [parentQuery.data?.data] : []}
                option={({ item: location }) => ({
                  key: location?.id,
                  label: `${location?.name} (${location?.nameBn})`,
                  value: location?.id,
                })}
                onChangeSearchTerm={(searchTerm) => setLocationSearchTerm(searchTerm)}
                query={parentLocationsQuery}
                disabled={!parentType}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="position" className="!mb-0">
              <FloatInput placeholder="Position" type="number" />
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

export default LocationsForm;
