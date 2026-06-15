import CustomSwitch from '@base/components/CustomSwitch';
import DragSortableTable, { handleBulkPurifiedDataFn, handleNewOrderedDataFn } from '@base/components/DragSortableTable';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useRef, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { LocationsHooks } from '../lib/hooks';
import { ILocation } from '../lib/interfaces';
import LocationsForm from './LocationsForm';

interface IProps {
  isLoading: boolean;
  data: ILocation[];
  pagination: PaginationProps;
  meta?: {
    page: number;
    limit: number;
    total: number;
    skip: number;
  };
}

const LocationsList: React.FC<IProps> = ({ isLoading, data, pagination, meta }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<ILocation>(null);
  const isBulkUpdateRef = useRef(false);

  const locationUpdateFn = LocationsHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        if (!isBulkUpdateRef.current) {
          messageApi.success(res.message);
        }
      },
    },
  });

  const handleDragEnd = (newData: any[], oldData: any[]) => {
    if (!meta) {
      messageApi.warning('Pagination metadata is required for drag and drop functionality');
      return;
    }

    getAccess(['locations:update'], () => {
      const orderedData = handleNewOrderedDataFn(newData, meta);
      const bulkUpdateData = handleBulkPurifiedDataFn(orderedData, oldData);

      if (bulkUpdateData.length === 0) {
        messageApi.info('No position changes detected');
        return;
      }

      isBulkUpdateRef.current = true;
      const updatePromises = bulkUpdateData.map((item) =>
        locationUpdateFn.mutateAsync({ id: item.id, data: { position: item.data.order_priority } }),
      );

      Promise.all(updatePromises)
        .then(() => {
          messageApi.success(`Successfully updated ${bulkUpdateData.length} location positions`);
        })
        .catch((error) => {
          messageApi.error('Failed to update some location positions');
          console.error('Bulk update error:', error);
        })
        .finally(() => {
          isBulkUpdateRef.current = false;
        });
    });
  };

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    name: elem?.name,
    nameBn: elem?.nameBn,
    slug: elem?.slug,
    type: elem?.type,
    parentName: elem?.parent?.name,
    position: elem?.position,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
    createdBy: elem?.createdBy?.fullName,
    updatedAt: elem?.updatedAt,
    updatedBy: elem?.updatedBy?.fullName,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Name',
    },
    {
      key: 'nameBn',
      dataIndex: 'nameBn',
      title: 'Name (Bn)',
    },
    {
      key: 'type',
      dataIndex: 'type',
      title: 'Type',
    },
    {
      key: 'parentName',
      dataIndex: 'parentName',
      title: 'Parent',
    },
    {
      key: 'position',
      dataIndex: 'position',
      title: 'Position',
    },
    {
      key: 'isActive',
      dataIndex: 'isActive',
      title: 'Active',
      render: (isActive, record) => (
        <CustomSwitch
          checked={isActive}
          onChange={(checked) => {
            getAccess(['locations:update'], () => {
              locationUpdateFn.mutate({
                id: record?.id,
                data: {
                  isActive: checked,
                },
              });
            });
          }}
        />
      ),
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => (
        <Button
          onClick={() => {
            getAccess(['locations:update'], () => {
              const item = data?.find((item) => item.id === id);
              setUpdateItem(item);
            });
          }}
        >
          <AiFillEdit />
        </Button>
      ),
    },
  ];

  return (
    <React.Fragment>
      {messageHolder}
      {meta ? (
        <DragSortableTable
          loading={isLoading}
          dataSource={dataSource}
          columns={columns}
          pagination={pagination}
          scroll={{ x: true }}
          onDragEnd={handleDragEnd}
        />
      ) : (
        <Table loading={isLoading} dataSource={dataSource} columns={columns} pagination={pagination} scroll={{ x: true }} />
      )}
      <Drawer
        width={640}
        title={`Update ${updateItem?.name}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <LocationsForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            isActive: updateItem?.isActive,
          }}
          isLoading={locationUpdateFn.isPending}
          onFinish={(values) =>
            locationUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
    </React.Fragment>
  );
};

export default LocationsList;
