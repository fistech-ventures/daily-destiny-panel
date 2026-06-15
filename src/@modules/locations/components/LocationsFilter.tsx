import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import { Toolbox } from '@lib/utils';
import { LocationsHooks } from '@modules/locations/lib/hooks';
import { ILocation, ILocationsFilter } from '@modules/locations/lib/interfaces';
import { Button, Col, DatePicker, Drawer, Form, Radio, Row, Select, Space } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';

interface IProps {
  initialValues: ILocationsFilter;
  onChange: (values: ILocationsFilter) => void;
}

const locationTypes = [
  { value: 'country', label: 'Country' },
  { value: 'division', label: 'Division' },
  { value: 'district', label: 'District' },
  { value: 'upazilla', label: 'Upazilla' },
  { value: 'union', label: 'Union' },
  { value: 'city_corporation', label: 'City Corporation' },
  { value: 'pourosova', label: 'Pourashava' },
];

const LocationsFilter: React.FC<IProps> = ({ initialValues, onChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState<string | null>(null);

  const locationsQuery = LocationsHooks.useFindInfinite({
    options: {
      limit: 20,
      searchTerm: locationSearchTerm,
      isActive: 'true',
    },
  });

  useEffect(() => {
    formInstance.resetFields();
    const values = {
      isActive: '',
      sortOrder: '',
      type: '',
      parentId: undefined,
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
      <Drawer width={540} title="Filter Locations" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
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
                  <Radio.Button className="w-1/3" value="">
                    All
                  </Radio.Button>
                  <Radio.Button className="w-1/3" value="true">
                    Active
                  </Radio.Button>
                  <Radio.Button className="w-1/3" value="false">
                    Inactive
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item name="type" label="Location Type" className="!mb-0">
                <Select placeholder="Select Type" allowClear options={locationTypes} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="parentId" label="Parent Location" className="!mb-0">
                <InfiniteScrollSelect<ILocation>
                  allowClear
                  showSearch
                  virtual={false}
                  placeholder="Parent Location"
                  option={({ item: location }) => ({
                    key: location?.id,
                    label: `${location?.name} (${location?.nameBn})`,
                    value: location?.id,
                  })}
                  onChangeSearchTerm={(searchTerm) => setLocationSearchTerm(searchTerm)}
                  query={locationsQuery}
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

export default LocationsFilter;
