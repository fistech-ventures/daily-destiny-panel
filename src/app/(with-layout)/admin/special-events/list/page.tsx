"use client";

import BaseSearch from "@base/components/BaseSearch";
import PageHeader from "@base/components/PageHeader";
import { Toolbox } from "@lib/utils";
import Authorization from "@modules/auth/components/Authorization";
import WithAuthorization from "@modules/auth/components/WithAuthorization";
import SpecialEventsFilter from "@modules/special-events/components/SpecialEventsFilter";
import SpecialEventsForm from "@modules/special-events/components/SpecialEventsForm";
import SpecialEventsList from "@modules/special-events/components/SpecialEventsList";
import { SpecialEventsHooks } from "@modules/special-events/lib/hooks";
import { ISpecialEvent, ISpecialEventsFilter } from "@modules/special-events/lib/interfaces";
import { Button, Drawer, Form, message, Tag } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const SpecialEventsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [updateItem, setUpdateItem] = useState<ISpecialEvent>(null);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<ISpecialEventsFilter>(
    `?${searchParams.toString()}`,
  );

  const specialEventsQuery = SpecialEventsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const specialEventCreateFn = SpecialEventsHooks.useCreate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setDrawerOpen(false);
        formInstance.resetFields();
        messageApi.success(res.message);
      },
    },
  });

  const specialEventUpdateFn = SpecialEventsHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        formInstance.resetFields();
        messageApi.success(res.message);
      },
    },
  });

  const handleEdit = (item: ISpecialEvent) => {
    setUpdateItem(item);
  };

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Special Events"
        subTitle={<BaseSearch />}
        tags={[
          <Tag key={1}>Total: {specialEventsQuery.data?.meta?.total || 0}</Tag>,
        ]}
        extra={
          <Authorization allowedAccess={["special-events:write"]}>
            <Button type="primary" onClick={() => {
              setUpdateItem(null);
              formInstance.resetFields();
              setDrawerOpen(true);
            }}>
              Create Event
            </Button>
          </Authorization>
        }
      />
      <SpecialEventsFilter
        initialValues={Toolbox.toCleanObject(
          Object.fromEntries(searchParams.entries()),
        )}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({
            ...Object.fromEntries(searchParams.entries()),
            ...values,
          });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <SpecialEventsList
        isLoading={specialEventsQuery.isLoading}
        data={specialEventsQuery.data?.data}
        onEdit={handleEdit}
        pagination={{
          current: page,
          pageSize: limit,
          total: specialEventsQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({
              ...Object.fromEntries(searchParams.entries()),
              page,
              limit,
            });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      {/* Create Drawer */}
      <Drawer
        width={640}
        title="Create a new Special Event"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <SpecialEventsForm
          formType="create"
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={specialEventCreateFn.isPending}
          onFinish={(values) => specialEventCreateFn.mutate(values)}
        />
      </Drawer>
      {/* Edit Drawer */}
      <Drawer
        width={640}
        title={`Update Event - ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
        destroyOnClose
      >
        <SpecialEventsForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            articleIds: updateItem?.articles?.map((a) => String(a.id)),
          }}
          isLoading={specialEventUpdateFn.isPending}
          onFinish={(values) =>
            specialEventUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(SpecialEventsPage, {
  allowedAccess: ["special-events:read"],
});
