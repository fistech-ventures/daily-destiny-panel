import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import { Toolbox } from '@lib/utils';
import { Button, Col, Form, FormInstance, Input, Radio, Row, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  ENUM_LAYOUT_BLOCK_MODE_TYPE,
  ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE,
  layoutBlockEntityTypes,
  layoutBlockModeTypes,
  layoutBlockViewTypes,
  layoutBlockWrapperViewTypes,
  TLayoutBlockWrapperViewType,
} from '../lib/enums';
import { LayoutHooks } from '../lib/hooks';
import { IComponentNode } from '../lib/interfaces';
import { arrToObjFn, getEndpointFn, objToArrayFn } from '../lib/utils';

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<
    IComponentNode & {
      title: string;
      viewAllUrl: string;
      wrapperOptions: Record<string, string>;
      wrapperView: TLayoutBlockWrapperViewType;
      wrapperViewOptions: Record<string, string>;
      wrapperViewStyles: Record<string, string>;
    }
  >;
  onFinish: (values: IComponentNode) => void;
}

const BlockForm: React.FC<IProps> = ({ isLoading, form, formType = 'create', initialValues, onFinish }) => {
  const formValues = Form.useWatch([], form);
  const [entitySearchTerm, setEntitySearchTerm] = useState(null);

  const handleFinishFn = (values) => {
    if (values?.mode === ENUM_LAYOUT_BLOCK_MODE_TYPE.SINGLE) {
      values.wrapperView = ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER;
      values.wrapperViewOptions = null;
      values.entityOptions = null;
    } else {
      values.entityId = null;
      values.entityOptions = Toolbox.isEmpty(values?.entityOptions) ? null : arrToObjFn(values?.entityOptions);
      values.wrapperViewOptions = Toolbox.isEmpty(values?.wrapperViewOptions)
        ? null
        : arrToObjFn(values?.wrapperViewOptions);
    }

    values.viewAllUrl = values?.viewAllUrl || null;
    values.wrapperOptions = Toolbox.isEmpty(values?.wrapperOptions) ? null : arrToObjFn(values?.wrapperOptions);
    values.wrapperViewStyles = Toolbox.isEmpty(values?.wrapperViewStyles)
      ? null
      : arrToObjFn(values?.wrapperViewStyles);
    values.styles = Toolbox.isEmpty(values?.styles) ? null : arrToObjFn(values?.styles);

    onFinish(values);
  };

  const layoutQueryById = LayoutHooks.useFindById({
    id: formValues?.entityId,
    config: {
      queryKey: [],
      enabled: !!formValues?.entityId,
    },
    endPoint: getEndpointFn(formValues?.entity),
  });

  const layoutQuery = LayoutHooks.useFindInfinite({
    config: {
      queryKey: [formValues?.entity],
      enabled: !!formValues?.entity && formValues?.mode === ENUM_LAYOUT_BLOCK_MODE_TYPE.SINGLE,
    },
    endPoint: getEndpointFn(formValues?.entity),
    options: {
      limit: 20,
      searchTerm: entitySearchTerm,
    },
  });

  useEffect(() => {
    form.resetFields();
  }, [form, initialValues]);

  return (
    <Form
      autoComplete="off"
      size="large"
      layout="vertical"
      form={form}
      initialValues={{
        ...initialValues,
        wrapperOptions: objToArrayFn(initialValues?.wrapperOptions),
        wrapperViewOptions: objToArrayFn(initialValues?.wrapperViewOptions),
        entityOptions: objToArrayFn(initialValues?.entityOptions),
        styles: objToArrayFn(initialValues?.styles),
        wrapperViewStyles: objToArrayFn(initialValues?.wrapperViewStyles),
      }}
      onFinish={handleFinishFn}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <div className="border border-gray-300 rounded-xl p-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: 'Title is required!',
                    },
                  ]}
                  className="!mb-0"
                >
                  <Input placeholder="Title" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="viewAllUrl" className="!mb-0">
                  <Input placeholder="View All URL" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="mode"
            rules={[
              {
                required: true,
                message: 'Mode is required!',
              },
            ]}
            className="!mb-0"
          >
            <Select
              showSearch
              allowClear
              virtual={false}
              placeholder="Mode"
              filterOption={(input, option) => (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase())}
              options={layoutBlockModeTypes.map((type) => ({
                key: type,
                label: Toolbox.toPrettyText(type),
                value: type,
              }))}
            />
          </Form.Item>
        </Col>
        {formValues?.mode === ENUM_LAYOUT_BLOCK_MODE_TYPE.MULTIPLE && (
          <Col xs={24}>
            <Form.Item name="wrapperView" className="!mb-0">
              <Radio.Group buttonStyle="solid" className="w-full text-center">
                {layoutBlockWrapperViewTypes.map((type) => (
                  <Radio.Button key={type} className="w-1/2" value={type}>
                    {Toolbox.toPrettyText(type)}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
        )}
        <Col xs={24}>
          <div className="border border-gray-300 rounded-xl p-4">
            <Row gutter={[16, 16]}>
              {formValues?.wrapperView === ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.SLIDER && (
                <Col xs={24}>
                  <Form.List name="wrapperViewOptions">
                    {(fields, { add, remove }) => {
                      return (
                        <React.Fragment>
                          {fields.map(({ key, name, ...rest }, idx) => (
                            <div
                              key={key}
                              className="relative p-4 border border-dashed border-[var(--color-primary-500)] rounded-md"
                            >
                              <Row gutter={[16, 16]}>
                                <p className="absolute top-0 left-4 -translate-y-1/2 bg-[var(--color-primary-500)] px-1.5 py-0.5 text-xs text-white rounded-md">
                                  wrapperView Option: {idx + 1}
                                </p>
                                <Col xs={24} md={12}>
                                  <Form.Item
                                    {...rest}
                                    name={[name, 'key']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Key is required!',
                                      },
                                    ]}
                                    className="!mb-0"
                                  >
                                    <Input placeholder="Key" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item
                                    {...rest}
                                    name={[name, 'value']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Value is required!',
                                      },
                                    ]}
                                    className="!mb-0"
                                  >
                                    <Input placeholder="Value" />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <div className="flex justify-center gap-4 mt-8">
                                <Button size="small" type="primary" ghost onClick={() => add({}, idx + 1)}>
                                  Add More
                                </Button>
                                <Button size="small" type="dashed" onClick={() => remove(name)}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                          {fields.length === 0 && (
                            <Button type="dashed" loading={isLoading} onClick={() => add()} block>
                              Add Wrapper View Option
                            </Button>
                          )}
                        </React.Fragment>
                      );
                    }}
                  </Form.List>
                </Col>
              )}
              <Col xs={24}>
                <Form.List name="wrapperOptions">
                  {(fields, { add, remove }) => {
                    return (
                      <React.Fragment>
                        {fields.map(({ key, name, ...rest }, idx) => (
                          <div
                            key={key}
                            className="relative p-4 border border-dashed border-[var(--color-primary-500)] rounded-md"
                          >
                            <Row gutter={[16, 16]}>
                              <p className="absolute top-0 left-4 -translate-y-1/2 bg-[var(--color-primary-500)] px-1.5 py-0.5 text-xs text-white rounded-md">
                                Wrapper Option: {idx + 1}
                              </p>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  {...rest}
                                  name={[name, 'key']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Key is required!',
                                    },
                                  ]}
                                  className="!mb-0"
                                >
                                  <Input placeholder="Key" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  {...rest}
                                  name={[name, 'value']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Value is required!',
                                    },
                                  ]}
                                  className="!mb-0"
                                >
                                  <Input placeholder="Value" className="!w-full" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <div className="flex justify-center gap-4 mt-8">
                              <Button size="small" type="primary" ghost onClick={() => add({}, idx + 1)}>
                                Add More
                              </Button>
                              <Button size="small" type="dashed" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                        {fields.length === 0 && (
                          <Button type="dashed" loading={isLoading} onClick={() => add()} block>
                            Add Wrapper Option
                          </Button>
                        )}
                      </React.Fragment>
                    );
                  }}
                </Form.List>
              </Col>
              <Col xs={24}>
                <Form.List name="wrapperViewStyles">
                  {(fields, { add, remove }) => {
                    return (
                      <React.Fragment>
                        {fields.map(({ key, name, ...rest }, idx) => (
                          <div
                            key={key}
                            className="relative p-4 border border-dashed border-[var(--color-primary-500)] rounded-md"
                          >
                            <Row gutter={[16, 16]}>
                              <p className="absolute top-0 left-4 -translate-y-1/2 bg-[var(--color-primary-500)] px-1.5 py-0.5 text-xs text-white rounded-md">
                                Wrapper Style: {idx + 1}
                              </p>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  {...rest}
                                  name={[name, 'key']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Key is required!',
                                    },
                                  ]}
                                  className="!mb-0"
                                >
                                  <Input placeholder="Key" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  {...rest}
                                  name={[name, 'value']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Value is required!',
                                    },
                                  ]}
                                  className="!mb-0"
                                >
                                  <Input placeholder="Value" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <div className="flex justify-center gap-4 mt-8">
                              <Button size="small" type="primary" ghost onClick={() => add({}, idx + 1)}>
                                Add More
                              </Button>
                              <Button size="small" type="dashed" onClick={() => remove(name)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                        {fields.length === 0 && (
                          <Button type="dashed" loading={isLoading} onClick={() => add()} block>
                            Add Wrapper Style
                          </Button>
                        )}
                      </React.Fragment>
                    );
                  }}
                </Form.List>
              </Col>
            </Row>
          </div>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="entity"
            rules={[
              {
                required: true,
                message: 'Entity is required!',
              },
            ]}
            className="!mb-0"
          >
            <Select
              showSearch
              allowClear
              virtual={false}
              placeholder="Entity"
              filterOption={(input, option) => (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase())}
              onChange={() => form.resetFields(['entityId'])}
              options={layoutBlockEntityTypes.map((type) => ({
                key: type,
                label: Toolbox.toPrettyText(type),
                value: type,
              }))}
            />
          </Form.Item>
        </Col>
        {formValues?.mode === ENUM_LAYOUT_BLOCK_MODE_TYPE.SINGLE && (
          <Col xs={24}>
            <Form.Item
              name="entityId"
              rules={[
                {
                  required: true,
                  message: 'Entity id is required!',
                },
              ]}
              className="!mb-0"
            >
              <InfiniteScrollSelect
                disabled={!formValues?.entity}
                allowClear
                showSearch
                virtual={false}
                placeholder="Entity ID"
                initialOptions={layoutQueryById.data?.data?.id ? [layoutQueryById.data?.data] : []}
                option={({ item: entity }) => ({
                  key: entity?.id,
                  label: entity?.title,
                  value: entity?.id,
                })}
                onChangeSearchTerm={(searchTerm) => setEntitySearchTerm(searchTerm)}
                query={layoutQuery}
              />
            </Form.Item>
          </Col>
        )}
        {formValues?.mode === ENUM_LAYOUT_BLOCK_MODE_TYPE.MULTIPLE && (
          <Col xs={24}>
            <Form.List name="entityOptions">
              {(fields, { add, remove }) => {
                return (
                  <React.Fragment>
                    {fields.map(({ key, name, ...rest }, idx) => (
                      <div
                        key={key}
                        className="relative p-4 border border-dashed border-[var(--color-primary-500)] rounded-md"
                      >
                        <Row gutter={[16, 16]}>
                          <p className="absolute top-0 left-4 -translate-y-1/2 bg-[var(--color-primary-500)] px-1.5 py-0.5 text-xs text-white rounded-md">
                            Entity Option: {idx + 1}
                          </p>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...rest}
                              name={[name, 'key']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Key is required!',
                                },
                              ]}
                              className="!mb-0"
                            >
                              <Input placeholder="Key" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              {...rest}
                              name={[name, 'value']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Value is required!',
                                },
                              ]}
                              className="!mb-0"
                            >
                              <Input placeholder="Value" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <div className="flex justify-center gap-4 mt-8">
                          <Button size="small" type="primary" ghost onClick={() => add({}, idx + 1)}>
                            Add More
                          </Button>
                          <Button size="small" type="dashed" onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <Button type="dashed" loading={isLoading} onClick={() => add()} block>
                        Add Entity Option
                      </Button>
                    )}
                  </React.Fragment>
                );
              }}
            </Form.List>
          </Col>
        )}
        <Col xs={24}>
          <Form.Item
            name="view"
            rules={[
              {
                required: true,
                message: 'View is required!',
              },
            ]}
            className="!mb-0"
          >
            <Select
              showSearch
              allowClear
              virtual={false}
              placeholder="View"
              filterOption={(input, option) => (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase())}
              options={layoutBlockViewTypes.map((type) => ({
                key: type,
                label: Toolbox.toPrettyText(type),
                value: type,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.List name="styles">
            {(fields, { add, remove }) => {
              return (
                <React.Fragment>
                  {fields.map(({ key, name, ...rest }, idx) => (
                    <div
                      key={key}
                      className="relative p-4 border border-dashed border-[var(--color-primary-500)] rounded-md"
                    >
                      <Row gutter={[16, 16]}>
                        <p className="absolute top-0 left-4 -translate-y-1/2 bg-[var(--color-primary-500)] px-1.5 py-0.5 text-xs text-white rounded-md">
                          Style: {idx + 1}
                        </p>
                        <Col xs={24} md={12}>
                          <Form.Item
                            {...rest}
                            name={[name, 'key']}
                            rules={[
                              {
                                required: true,
                                message: 'Key is required!',
                              },
                            ]}
                            className="!mb-0"
                          >
                            <Input placeholder="Key" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            {...rest}
                            name={[name, 'value']}
                            rules={[
                              {
                                required: true,
                                message: 'Value is required!',
                              },
                            ]}
                            className="!mb-0"
                          >
                            <Input placeholder="Value" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <div className="flex justify-center gap-4 mt-8">
                        <Button size="small" type="primary" ghost onClick={() => add({}, idx + 1)}>
                          Add More
                        </Button>
                        <Button size="small" type="dashed" onClick={() => remove(name)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <Button type="dashed" loading={isLoading} onClick={() => add()} block>
                      Add Style
                    </Button>
                  )}
                </React.Fragment>
              );
            }}
          </Form.List>
        </Col>
        <Col xs={24}>
          <Form.Item className="text-right !mb-0">
            <Button loading={isLoading} type="primary" htmlType="submit">
              {formType === 'create' ? 'Submit' : 'Update'}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default BlockForm;
