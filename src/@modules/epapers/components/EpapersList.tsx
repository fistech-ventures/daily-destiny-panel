import ConfirmationDialog from "@base/components/ConfirmationDialog";
import CustomSwitch from "@base/components/CustomSwitch";
import { getAccess } from "@modules/auth/lib/utils/client";
import type { PaginationProps, TableColumnsType } from "antd";
import { Button, Drawer, Form, Image, message, Table } from "antd";
import React, { useState } from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { EpapersHooks } from "../lib/hooks";
import { EpapersServices } from "../lib/services";
import { IEpaper } from "../lib/interfaces";
import EpapersForm from "./EpapersForm";
import EpapersBulkUploadForm from "./EpapersBulkUploadForm";
import dayjs from "dayjs";

interface IProps {
  isLoading: boolean;
  data: IEpaper[];
  pagination: PaginationProps;
}

const EpapersList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [updateItem, setUpdateItem] = useState<IEpaper>(null);
  const [editPaperItem, setEditPaperItem] = useState<IEpaper>(null);
  const [formInstance] = Form.useForm();
  const [editFormInstance] = Form.useForm();
  const [existingPagesCount, setExistingPagesCount] = useState(0);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const epaperUpdateFn = EpapersHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        messageApi.success(res.message);
      },
    },
  });

  const epaperAddPagesFn = EpapersHooks.useAddPagesToExisting({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setEditPaperItem(null);
        setExistingPagesCount(0);
        editFormInstance.resetFields();
        messageApi.success(res.message);
      },
    },
  });

  const handleEditPaper = async (item: IEpaper) => {
    setEditPaperItem(item);
    try {
      const existingPages = await EpapersServices.findPagesByDate(item.date, item.publicationName);
      setExistingPagesCount(existingPages?.data?.length || 0);
      editFormInstance.setFieldsValue({ date: dayjs(item.date) });
    } catch {
      setExistingPagesCount(0);
    }
  };

  const handleEditDateChange = async (date: any) => {
    if (date && editPaperItem) {
      try {
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const existingPages = await EpapersServices.findPagesByDate(dateStr, editPaperItem.publicationName);
        setExistingPagesCount(existingPages?.data?.length || 0);
      } catch {
        setExistingPagesCount(0);
      }
    } else {
      setExistingPagesCount(0);
    }
  };

  const epaperDeleteFn = EpapersHooks.useDelete({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
        messageApi.success(res.message);
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    date: elem?.date,
    pageNumber: elem?.pageNumber,
    imageUrl: elem?.imageUrl,
    publicationName: elem?.publicationName,
    title: elem?.title,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
    createdBy: elem?.createdBy?.fullName,
    updatedAt: elem?.updatedAt,
    updatedBy: elem?.updatedBy?.fullName,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: "imageUrl",
      dataIndex: "imageUrl",
      title: "Image",
      width: 100,
      render: (imageUrl) => (
        <Image
          src={imageUrl}
          alt="E-Paper"
          width={60}
          height={80}
          preview
          style={{ objectFit: "cover" }}
        />
      ),
    },
    {
      key: "date",
      dataIndex: "date",
      title: "Date",
      width: 120,
    },
    {
      key: "pageNumber",
      dataIndex: "pageNumber",
      title: "Page",
      width: 80,
    },
    {
      key: "title",
      dataIndex: "title",
      title: "Title",
      width: 150,
    },
    {
      key: "publicationName",
      dataIndex: "publicationName",
      title: "Publication",
      width: 150,
    },
    {
      key: "isActive",
      dataIndex: "isActive",
      title: "Active",
      width: 80,
      render: (isActive, record) => (
        <CustomSwitch
          checked={isActive}
          onChange={(checked) => {
            getAccess(["epapers:update"], () => {
              const action = checked ? 'activate' : 'deactivate';
              setConfirmationDialog({
                open: true,
                title: `${action.charAt(0).toUpperCase() + action.slice(1)} E-Paper`,
                content: `Are you sure you want to ${action} e-paper from ${record.date}?`,
                onConfirm: () => {
                  epaperUpdateFn.mutate({
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
      ),
    },
    {
      key: "id",
      dataIndex: "id",
      title: "Action",
      align: "center",
      width: 150,
      render: (id, _record) => {
        const item = data?.find((item) => item.id === id);
        return (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => {
                getAccess(["epapers:update"], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              onClick={() => {
                getAccess(["epapers:update"], () => {
                  handleEditPaper(item);
                });
              }}
            >
              <FaPlus />
            </Button>
            <Button
              danger
              onClick={() => {
                getAccess(["epapers:delete"], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete E-Paper',
                    content: `Are you sure you want to delete e-paper from ${item.date}?`,
                    onConfirm: () => {
                      epaperDeleteFn.mutate(item.id);
                      setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                    },
                  });
                });
              }}
            >
              <AiFillDelete />
            </Button>
          </div>
        );
      },
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
        title={`Update E-Paper - ${updateItem?.date} (Page ${updateItem?.pageNumber})`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
        destroyOnClose
      >
        <EpapersForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            isActive: updateItem?.isActive,
          }}
          isLoading={epaperUpdateFn.isPending}
          onFinish={(values) =>
            epaperUpdateFn.mutate({
              id: updateItem?.id,
              data: {
                ...values,
                date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : values.date,
              },
            })
          }
        />
      </Drawer>
      <Drawer
        width={800}
        title={`Add Pages to Paper - ${editPaperItem?.date}`}
        open={!!editPaperItem?.id}
        onClose={() => {
          setEditPaperItem(null);
          setExistingPagesCount(0);
          editFormInstance.resetFields();
        }}
        destroyOnClose
      >
        <EpapersBulkUploadForm
          form={editFormInstance}
          isLoading={epaperAddPagesFn.isPending}
          onFinish={(values) => epaperAddPagesFn.mutate(values)}
          onAddPages={(values) => epaperAddPagesFn.mutate(values)}
          existingPagesCount={existingPagesCount}
          onDateChange={handleEditDateChange}
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

export default EpapersList;
