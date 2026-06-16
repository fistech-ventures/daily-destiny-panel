import CustomSwitch from "@base/components/CustomSwitch";
import { getAccess } from "@modules/auth/lib/utils/client";
import type { PaginationProps, TableColumnsType } from "antd";
import { Button, Drawer, Form, Image, message, Table } from "antd";
import React, { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { EpapersHooks } from "../lib/hooks";
import { IEpaper } from "../lib/interfaces";
import EpapersForm from "./EpapersForm";

interface IProps {
  isLoading: boolean;
  data: IEpaper[];
  pagination: PaginationProps;
}

const EpapersList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [updateItem, setUpdateItem] = useState<IEpaper>(null);
  const [formInstance] = Form.useForm();

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

  // const epaperDeleteFn = EpapersHooks.useDelete({
  //   config: {
  //     onSuccess: (res) => {
  //       if (!res.success) {
  //         messageApi.error(res.message);
  //         return;
  //       }

  //       messageApi.success(res.message);
  //     },
  //   },
  // });

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
              epaperUpdateFn.mutate({
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
      key: "id",
      dataIndex: "id",
      title: "Action",
      align: "center",
      width: 100,
      render: (id) => (
        <Button
          onClick={() => {
            getAccess(["epapers:update"], () => {
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
              data: values,
            })
          }
        />
      </Drawer>
    </React.Fragment>
  );
};

export default EpapersList;
