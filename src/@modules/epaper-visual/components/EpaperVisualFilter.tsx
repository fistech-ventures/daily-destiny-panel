import { Toolbox } from '@lib/utils';
import { IEditionsFilter } from '@modules/epaper-visual/lib/interfaces';
import { Button, Col, DatePicker, Drawer, Form, Radio, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { MdClear } from 'react-icons/md';

interface IProps {
  initialValues: IEditionsFilter;
  onChange: (values: IEditionsFilter) => void;
}

const EpaperVisualFilter: React.FC<IProps> = ({ initialValues, onChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    formInstance.resetFields();
    const values: any = {
      status: '',
      publishDate: undefined,
      ...initialValues,
    };

    if (values?.publishDate) {
      values.publishDate = dayjs(values.publishDate);
    }

    formInstance.setFieldsValue(values);
  }, [formInstance, initialValues]);

  return (
    <div className="flex flex-wrap gap-3 justify-end mb-4">
      <Button type="primary" icon={<FaFilter />} onClick={() => setDrawerOpen(true)} ghost>
        Filter
      </Button>
      <Drawer width={420} title="Filter Editions" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <Form
          form={formInstance}
          layout="vertical"
          onFinish={Toolbox.debounce((values) => {
            const formatted = {
              ...values,
              publishDate: values?.publishDate ? dayjs(values.publishDate).format('YYYY-MM-DD') : undefined,
              status: values?.status || undefined,
            };
            onChange(Toolbox.toCleanObject(formatted));
            setDrawerOpen(false);
          }, 1000)}
          className="flex flex-col gap-3"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="status" label="Status" className="!mb-0">
                <Radio.Group buttonStyle="solid" className="w-full text-center">
                  <Radio.Button className="w-1/3" value="">
                    All
                  </Radio.Button>
                  <Radio.Button className="w-1/3" value="draft">
                    Draft
                  </Radio.Button>
                  <Radio.Button className="w-1/3" value="published">
                    Published
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="publishDate" label="Publish Date" className="!mb-0">
                <DatePicker className="w-full" />
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
                        publishDate: null,
                        status: null,
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

export default EpaperVisualFilter;
