import CustomSwitch from '@base/components/CustomSwitch';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { MarketPricesHooks } from '../lib/hooks';
import { IMarketPrice } from '../lib/interfaces';
import MarketPricesForm from './MarketPricesForm';

interface IProps {
  isLoading: boolean;
  data: IMarketPrice[];
  pagination: PaginationProps;
}

const MarketPricesList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IMarketPrice | null>(null);

  const updateMutation = MarketPricesHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        messageApi.success(res.message);
      },
      onError: (error: any) => {
        messageApi.error(error?.message || 'Failed to update market price');
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    title: elem?.title,
    titleBn: elem?.titleBn,
    priceRange: elem?.priceRange,
    position: elem?.position,
    isActive: elem?.isActive,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
    },
    {
      key: 'titleBn',
      dataIndex: 'titleBn',
      title: 'Title (Bn)',
    },
    {
      key: 'priceRange',
      dataIndex: 'priceRange',
      title: 'Price Range',
    },
    {
      key: 'position',
      dataIndex: 'position',
      title: 'Position',
      align: 'center',
    },
    {
      key: 'isActive',
      dataIndex: 'isActive',
      title: 'Active',
      align: 'center',
      render: (isActive, record) => {
        return (
          <CustomSwitch
            checked={isActive}
            onChange={(checked) => {
              getAccess(['market-prices:update'], () => {
                updateMutation.mutate({
                  id: record?.id as any,
                  data: {
                    isActive: checked,
                  },
                });
              });
            }}
          />
        );
      },
    },
    {
      key: 'action',
      title: 'Action',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => {
              getAccess(['market-prices:update'], () => {
                const item = data?.find((item) => item.id === record.id);
                setUpdateItem(item || null);
              });
            }}
          >
            <AiFillEdit />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <React.Fragment>
      {messageHolder}
      <Table
        loading={isLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        scroll={{ x: true }}
      />
      <Drawer
        width={640}
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <MarketPricesForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
          }}
          isLoading={updateMutation.isPending}
          onFinish={(values) =>
            updateMutation.mutate({
              id: updateItem?.id as any,
              data: values,
            })
          }
        />
      </Drawer>
    </React.Fragment>
  );
};

export default MarketPricesList;
