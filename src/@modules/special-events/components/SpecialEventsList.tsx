import ConfirmationDialog from "@base/components/ConfirmationDialog";
import CustomSwitch from "@base/components/CustomSwitch";
import { getAccess } from "@modules/auth/lib/utils/client";
import type { PaginationProps, TableColumnsType } from "antd";
import { Button, Image, message, Table, Tag, Tooltip } from "antd";
import React, { useState } from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import dayjs from "dayjs";
import { SpecialEventsHooks } from "../lib/hooks";
import { ISpecialEvent } from "../lib/interfaces";

interface IProps {
  isLoading: boolean;
  data: ISpecialEvent[];
  pagination: PaginationProps;
  onEdit: (item: ISpecialEvent) => void;
}

const SpecialEventsList: React.FC<IProps> = ({ isLoading, data, pagination, onEdit }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const specialEventUpdateFn = SpecialEventsHooks.useUpdate({
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

  const specialEventDeleteFn = SpecialEventsHooks.useDelete({
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
    title: elem?.title,
    slug: elem?.slug,
    bannerImage: elem?.bannerImage,
    isActive: elem?.isActive,
    articleCount: elem?.articles?.length || 0,
    articles: elem?.articles,
    createdAt: elem?.createdAt,
    createdBy: elem?.createdBy?.fullName,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: "bannerImage",
      dataIndex: "bannerImage",
      title: "Banner",
      width: 100,
      render: (bannerImage) => (
        <Image
          src={bannerImage || "/placeholder.png"}
          alt="Banner"
          width={60}
          height={40}
          preview
          style={{ objectFit: "cover", borderRadius: 4 }}
          fallback="/placeholder.png"
        />
      ),
    },
    {
      key: "title",
      dataIndex: "title",
      title: "Title",
      width: 250,
      ellipsis: true,
    },
    {
      key: "slug",
      dataIndex: "slug",
      title: "Slug",
      width: 200,
      ellipsis: true,
      render: (slug) => <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{slug}</code>,
    },
    {
      key: "articleCount",
      dataIndex: "articleCount",
      title: "Articles",
      width: 90,
      align: "center",
      render: (count) => <Tag color={count > 0 ? "blue" : "default"}>{count}</Tag>,
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
            getAccess(["special-events:update"], () => {
              const action = checked ? 'activate' : 'deactivate';
              setConfirmationDialog({
                open: true,
                title: `${action.charAt(0).toUpperCase() + action.slice(1)} Event`,
                content: `Are you sure you want to ${action} "${record.title}"?`,
                onConfirm: () => {
                  specialEventUpdateFn.mutate({
                    id: record?.id,
                    data: { isActive: checked },
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
      key: "createdAt",
      dataIndex: "createdAt",
      title: "Created",
      width: 140,
      render: (date) => dayjs(date).format("MMM D, YYYY"),
    },
    {
      key: "id",
      dataIndex: "id",
      title: "Action",
      align: "center",
      width: 120,
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <div className="flex gap-2 justify-center">
            <Tooltip title="Edit">
              <Button
                onClick={() => {
                  getAccess(["special-events:update"], () => {
                    onEdit(item);
                  });
                }}
              >
                <AiFillEdit />
              </Button>
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                onClick={() => {
                  getAccess(["special-events:delete"], () => {
                    setConfirmationDialog({
                      open: true,
                      title: 'Delete Event',
                      content: `Are you sure you want to delete "${item?.title}"?`,
                      onConfirm: () => {
                        specialEventDeleteFn.mutate(item?.id);
                        setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                      },
                    });
                  });
                }}
              >
                <AiFillDelete />
              </Button>
            </Tooltip>
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

export default SpecialEventsList;
