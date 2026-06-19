import ConfirmationDialog from '@base/components/ConfirmationDialog';
import CustomSwitch from '@base/components/CustomSwitch';
import DragSortableTable, { handleBulkPurifiedDataFn, handleNewOrderedDataFn } from '@base/components/DragSortableTable';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useRef, useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { CategoriesHooks } from '../lib/hooks';
import { ICategory } from '../lib/interfaces';
import CategoriesForm from './CategoriesForm';

interface IProps {
  isLoading: boolean;
  data: ICategory[];
  pagination: PaginationProps;
  meta?: {
    page: number;
    limit: number;
    total: number;
    skip: number;
  };
}

const CategoriesList: React.FC<IProps> = ({ isLoading, data, pagination, meta }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<ICategory>(null);
  const isBulkUpdateRef = useRef(false);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const categoryUpdateFn = CategoriesHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        // Only show message if not doing bulk update
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

    getAccess(['categories:update'], () => {
      const orderedData = handleNewOrderedDataFn(newData, meta);
      const bulkUpdateData = handleBulkPurifiedDataFn(orderedData, oldData);
      
      if (bulkUpdateData.length === 0) {
        messageApi.info('No position changes detected');
        return;
      }

      isBulkUpdateRef.current = true;

      // Make multiple individual update calls
      const updatePromises = bulkUpdateData.map(item => 
        categoryUpdateFn.mutateAsync({
          id: item.id,
          data: { position: item.data.order_priority }
        })
      );

      // Execute all updates
      Promise.all(updatePromises)
        .then(() => {
          messageApi.success(`Successfully updated ${bulkUpdateData.length} category positions`);
        })
        .catch((error) => {
          messageApi.error('Failed to update some category positions');
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
    title: elem?.title,
    metaTitle: elem?.seoMetaData?.title,
    metaDescription: elem?.seoMetaData?.description,
    metaKeyword: elem?.seoMetaData?.keywords,
    titleBn: elem?.titleBn,
    isActive: elem?.isActive,
    position: elem?.position,
    createdAt: elem?.createdAt,
    createdBy: elem?.createdBy?.fullName,
    updatedAt: elem?.updatedAt,
    updatedBy: elem?.updatedBy?.fullName,
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
      key: 'position',
      dataIndex: 'position',
      title: 'Position',
    },
    {
      key: 'isActive',
      dataIndex: 'isActive',
      title: 'Active',
      render: (isActive, record) => {
        return (
          <CustomSwitch
            checked={isActive}
            onChange={(checked) => {
              getAccess(['categories:update'], () => {
                const action = checked ? 'activate' : 'deactivate';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Category`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    categoryUpdateFn.mutate({
                      id: record?.id,
                      data: {
                        isActive: checked,
                      },
                    });
                    setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                  },
                });
              });
            }}
          />
        );
      },
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => {
        return <Button
          onClick={() => {
            getAccess(['categories:update'], () => {
              const item = data?.find((item) => item.id === id);
              setUpdateItem(item);
            });
          }}
        >
          <AiFillEdit />
        </Button>;
      },
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
        <Table
          loading={isLoading}
          dataSource={dataSource}
          columns={columns}
          pagination={pagination}
          scroll={{ x: true }}
        />
      )}
      <Drawer
        width={640}
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <CategoriesForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            isActive: updateItem?.isActive,
            metaTitle: updateItem?.seoMetaData?.title,
            metaDescription: updateItem?.seoMetaData?.description,
            metaKeywords: updateItem?.seoMetaData?.keywords,
            metaImage: updateItem?.seoMetaData?.image,
          }}
          isLoading={categoryUpdateFn.isPending}
          onFinish={(values) =>
            categoryUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} })}
      />
    </React.Fragment>
  );
};

export default CategoriesList;
