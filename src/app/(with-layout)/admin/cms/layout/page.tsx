'use client';

import BaseModalWithoutClicker from '@base/components/BaseModalWithoutClicker';
import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import PageHeader from '@base/components/PageHeader';
import { States } from '@lib/constant';
import useSessionState from '@lib/hooks/useSessionState';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import BlockForm from '@modules/layout/components/BlockForm';
import Builder from '@modules/layout/components/Builder';
import {
  ENUM_LAYOUT_BLOCK_MODE_TYPE,
  ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE,
  ENUM_LAYOUT_NODE_TYPE,
} from '@modules/layout/lib/enums';
import { IColumnNode, IComponentNode, IRowNode } from '@modules/layout/lib/interfaces';
import { setColumnPropertiesFromBlock, updateNodeByIdFn } from '@modules/layout/lib/utils';
import { PagesHooks } from '@modules/pages/lib/hooks';
import { IPage } from '@modules/pages/lib/interfaces';
import { Button, Form, message, Space } from 'antd';
import { nanoid } from 'nanoid';
import React, { useEffect, useMemo, useState } from 'react';

const LayoutPage = () => {
  const [messageApi, messageHolder] = message.useMessage();
  const [layout, setLayout] = useSessionState<IRowNode[]>(States.layout);
  const [isModalOpen, setModalOpen] = useState(false);
  const [json, setJson] = useState<string>('');
  const [pageSlug, setPageSlug] = useState<string>(null);
  const [pageSearchTerm, setPageSearchTerm] = useState(null);

  // Global block editor state
  const [isBlockEditorOpen, setBlockEditorOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{
    block: IComponentNode;
    column: IColumnNode;
    blockIndex: number;
  }>(null);
  const [blockFormInstance] = Form.useForm();

  const handleJsonFn = () => {
    const json = JSON.stringify(layout, null, 2);
    setJson(json);
    setModalOpen(true);
  };

  // Global block editor functions
  const openBlockEditor = (block: IComponentNode, column: IColumnNode, blockIndex: number) => {
    setEditingBlock({ block, column, blockIndex });
    setBlockEditorOpen(true);

    // Set form initial values
    blockFormInstance.setFieldsValue({
      mode: ENUM_LAYOUT_BLOCK_MODE_TYPE.SINGLE,
      wrapperView: column.view || ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
      title: column.title,
      viewAllUrl: column.viewAllUrl,
      wrapperOptions: column.options,
      wrapperViewOptions: column.viewOptions,
      wrapperViewStyles: column.styles,
      ...block,
    });
  };

  const closeBlockEditor = () => {
    setBlockEditorOpen(false);
    setEditingBlock(null);
    blockFormInstance.resetFields();
  };

  const handleBlockUpdate = (
    updatedData: IComponentNode & {
      title: string;
      viewAllUrl: string;
      wrapperOptions: Record<string, string>;
      wrapperView: any;
      wrapperViewOptions: Record<string, string>;
      wrapperViewStyles: Record<string, string>;
    },
  ) => {
    if (!editingBlock) return;

    const { title, viewAllUrl, wrapperOptions, wrapperView, wrapperViewOptions, wrapperViewStyles, ...blockData } =
      updatedData;

    // Update layout with new block data and column properties
    setLayout((prev) =>
      updateNodeByIdFn(prev, String(editingBlock.column.uid), (column: IColumnNode) => {
        // Update column properties from block data
        const updatedColumn = setColumnPropertiesFromBlock(column, {
          title,
          viewAllUrl,
          wrapperOptions,
          wrapperView,
          wrapperViewOptions,
          wrapperViewStyles,
        });

        // Update the specific block in children
        const updatedChildren = [...updatedColumn.children];
        updatedChildren[editingBlock.blockIndex] = { ...editingBlock.block, ...blockData };

        return {
          ...updatedColumn,
          children: updatedChildren,
        };
      }),
    );

    closeBlockEditor();
  };

  const rowCreateFn = () => {
    setLayout((prev) => [
      ...prev,
      {
        uid: nanoid(),
        type: ENUM_LAYOUT_NODE_TYPE.ROW,
        columns: [
          {
            uid: nanoid(),
            type: ENUM_LAYOUT_NODE_TYPE.COLUMN,
            span: 12,
            options: null,
            styles: null,
            view: ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
            viewOptions: null,
            title: null,
            viewAllUrl: null,
            children: [],
          },
          {
            uid: nanoid(),
            type: ENUM_LAYOUT_NODE_TYPE.COLUMN,
            span: 12,
            options: null,
            styles: null,
            view: ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
            viewOptions: null,
            title: null,
            viewAllUrl: null,
            children: [],
          },
        ],
      } as IRowNode,
    ]);
  };

  const pageQuery = PagesHooks.useFindBySlug({
    slug: pageSlug,
    config: {
      queryKey: [],
      enabled: !!pageSlug,
    },
  });

  const pagesQuery = PagesHooks.useFindInfinite({
    options: {
      limit: 20,
      isActive: 'true',
      searchTerm: pageSearchTerm,
    },
  });

  const initialPage = useMemo(() => pagesQuery.data?.pages?.[0]?.data?.[0], [pagesQuery.data]);

  const pageUpsertFn = PagesHooks.useUpsert({
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

  useEffect(() => {
    if (Toolbox.isNotEmpty(pageQuery.data?.data)) {
      setLayout(pageQuery.data?.data?.layouts || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageQuery.data?.data?.id]);

  useEffect(() => {
    if (Toolbox.isNotEmpty(initialPage)) {
      setPageSlug(initialPage?.slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage?.id]);

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Layout"
        subTitle={
          <InfiniteScrollSelect<IPage>
            allowClear
            showSearch
            virtual={false}
            placeholder="Page"
            initialOptions={pageQuery.data?.data?.id ? [pageQuery.data?.data] : []}
            option={({ item: page }) => ({
              key: page?.id,
              label: page?.title,
              value: page?.slug,
            })}
            onChangeSearchTerm={setPageSearchTerm}
            query={pagesQuery}
            style={{ width: '13rem' }}
            onChange={setPageSlug}
            value={pageSlug}
          />
        }
        extra={
          <Space>
            <Authorization allowedAccess={['cms-layout:write']}>
              <Button type="primary" onClick={rowCreateFn}>
                + Create Row
              </Button>
            </Authorization>
            <Button disabled={!pageSlug || Toolbox.isEmpty(layout)} type="primary" onClick={handleJsonFn} ghost>
              Export JSON
            </Button>
            <Authorization allowedAccess={['cms-layout:write']}>
              <Button
                disabled={!pageSlug || Toolbox.isEmpty(layout)}
                type="primary"
                onClick={() =>
                  pageUpsertFn.mutate({
                    title: pageQuery.data?.data?.title,
                    slug: pageQuery.data?.data?.slug,
                    layouts: layout,
                  })
                }
              >
                Upsert
              </Button>
            </Authorization>
          </Space>
        }
      />
      <Builder
        cardWrapperClassName="mx-auto max-w-3xl mt-8"
        cardProps={{ className: '!text-xs !text-gray-600' }}
        onEditBlock={openBlockEditor}
      />
      <BaseModalWithoutClicker
        title="Layout JSON"
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{json}</pre>
      </BaseModalWithoutClicker>
      <BaseModalWithoutClicker
        destroyOnHidden
        open={isBlockEditorOpen}
        onCancel={closeBlockEditor}
        title="Edit Block"
        footer={null}
        width={800}
      >
        {editingBlock && (
          <BlockForm
            formType={editingBlock.block.entity ? 'update' : 'create'}
            isLoading={false}
            form={blockFormInstance}
            initialValues={{
              mode: ENUM_LAYOUT_BLOCK_MODE_TYPE.SINGLE,
              wrapperView: editingBlock.column.view || ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
              title: editingBlock.column.title,
              viewAllUrl: editingBlock.column.viewAllUrl,
              wrapperOptions: editingBlock.column.options,
              wrapperViewOptions: editingBlock.column.viewOptions,
              wrapperViewStyles: editingBlock.column.styles,
              ...editingBlock.block,
            }}
            onFinish={handleBlockUpdate}
          />
        )}
      </BaseModalWithoutClicker>
    </React.Fragment>
  );
};

export default WithAuthorization(LayoutPage, { allowedAccess: ['cms-layout:read'] });
