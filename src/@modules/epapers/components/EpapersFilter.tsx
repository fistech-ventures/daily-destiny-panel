import { Toolbox } from '@lib/utils';
import { IEpapersFilter } from '@modules/epapers/lib/interfaces';
import { Button, Col, DatePicker, Drawer, Form, Radio, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';

interface IProps {
  initialValues: IEpapersFilter;
  onChange: (values: IEpapersFilter) => void;
}

const EpapersFilter: React.FC<IProps> = ({ initialValues, onChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    formInstance.resetFields();
    const values = {
      isActive: '',
      sortOrder: '',
      searchTerm: '',
      publicationName: 'Daily Destiny',
      date: undefined,
      dateRange: [],
      ...initialValues,
    };

    if (values?.dateFrom && values?.dateTo) {
      values.dateRange.push(dayjs(values.dateFrom));
      values.dateRange.push(dayjs(values.dateTo));
      delete values.dateFrom;
      delete values.dateTo;
    }

    formInstance.setFieldsValue(values);
  }, [formInstance, initialValues]);

  return (
    <div className="flex flex-wrap gap-3 justify-end mb-4">
      <Button type="primary" icon={<FaFilter />} onClick={() => setDrawerOpen(true)} ghost>
        Filter
      </Button>
      <Drawer width={540} title="Filter E-Papers" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <Form
          form={formInstance}
          layout="vertical"
          onFinish={Toolbox.debounce((values) => {
            values.dateFrom = values?.dateRange?.length
              ? dayjs(values?.dateRange?.[0]).startOf('day').toISOString()
              : null;
            values.dateTo = values?.dateRange?.length
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

            <Col span={24}>
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

            <Col span={24}>
              <Form.Item name="searchTerm" label="Search" className="!mb-0">
                <input
                  type="text"
                  placeholder="Search by title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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
                        dateFrom: null,
                        dateTo: null,
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

export default EpapersFilter;
