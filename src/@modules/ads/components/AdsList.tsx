import ConfirmationDialog from "@base/components/ConfirmationDialog";
import CustomSwitch from "@base/components/CustomSwitch";
import { getAccess } from "@modules/auth/lib/utils/client";
import type { PaginationProps, TableColumnsType } from "antd";
import { Button, Drawer, Form, Image, Table, message } from "antd";
import React, { useState } from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { AdsHooks } from "../lib/hooks";
import { IAd } from "../lib/interfaces";
import AdsForm from "./AdsForm";

interface IProps {
  isLoading: boolean;
  data: IAd[];
  pagination: PaginationProps;
}

const AdsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IAd>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: "", content: "", onConfirm: () => {} });

  const adUpdateFn = AdsHooks.useUpdate({
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

  const adDeleteFn = AdsHooks.useDelete({
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
    thumbnail: elem?.imageUrl || elem?.videoUrl || elem?.scriptEmbedCode,
    id: elem?.id,
    type: elem?.type,
    title: elem?.title,
    pageType: elem?.pageType,
    position: elem?.position,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
    createdBy: elem?.createdBy?.fullName,
    updatedAt: elem?.updatedAt,
    updatedBy: elem?.updatedBy?.fullName,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: "thumbnail",
      dataIndex: "thumbnail",
      title: "Creative",
      render: (thumbnail) => (
        <Image
          src={thumbnail}
          alt="creative"
          preview={true}
          style={{ width: 100, height: 50, objectFit: "contain" }}
        />
      ),
    },
    {
      key: "type",
      dataIndex: "type",
      title: "Type",
    },
    {
      key: "title",
      dataIndex: "title",
      title: "Title",
    },
    {
      key: "pageType",
      dataIndex: "pageType",
      title: "Page Type",
      render: (pageType) => pageType || "-",
    },
    {
      key: "position",
      dataIndex: "position",
      title: "Position",
      render: (position) => position || "-",
    },
    {
      key: "isActive",
      dataIndex: "isActive",
      title: "Active",
      render: (isActive, record) => {
        return (
          <CustomSwitch
            checked={isActive}
            onChange={(checked) => {
              getAccess(["ads:update"], () => {
                const action = checked ? "activate" : "deactivate";
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Ad`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    adUpdateFn.mutate({
                      id: record?.id,
                      data: {
                        isActive: checked,
                      },
                    });
                    setConfirmationDialog({
                      open: false,
                      title: "",
                      content: "",
                      onConfirm: () => {},
                    });
                  },
                });
              });
            }}
          />
        );
      },
    },
    {
      key: "id",
      dataIndex: "id",
      title: "Action",
      align: "center",
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "center" }}
          >
            <Button
              onClick={() => {
                getAccess(["ads:update"], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              danger
              onClick={() => {
                getAccess(["ads:delete"], () => {
                  setConfirmationDialog({
                    open: true,
                    title: "Delete Ad",
                    content: `Are you sure you want to delete "${item.title}"?`,
                    onConfirm: () => {
                      adDeleteFn.mutate(item.id);
                      setConfirmationDialog({
                        open: false,
                        title: "",
                        content: "",
                        onConfirm: () => {},
                      });
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
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <AdsForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            isActive: updateItem?.isActive,
          }}
          isLoading={adUpdateFn.isPending}
          onFinish={(values) =>
            adUpdateFn.mutate({
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
        onCancel={() =>
          setConfirmationDialog({
            open: false,
            title: "",
            content: "",
            onConfirm: () => {},
          })
        }
      />
    </React.Fragment>
  );
};

export default AdsList;
