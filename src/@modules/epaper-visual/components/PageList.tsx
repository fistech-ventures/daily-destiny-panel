import CustomUploader from '@base/components/CustomUploader';
import { Button, Form, InputNumber, Modal, message } from 'antd';
import React, { useState } from 'react';
import { CreatePagePayload } from '../lib/interfaces';

interface PageItem {
  id: string;
  pageNumber: number;
  imageUrl: string;
}

interface IProps {
  pages: PageItem[];
  activePageId: string | null;
  onSelectPage: (pageId: string) => void;
  onAddPage: (payload: CreatePagePayload) => void;
  isAddingPage: boolean;
}

const PageList: React.FC<IProps> = ({ pages, activePageId, onSelectPage, onAddPage, isAddingPage }) => {
  const [, messageHolder] = message.useMessage();
  const [isModalOpen, setModalOpen] = useState(false);
  const [formInstance] = Form.useForm();

  const handleAddPage = (values: { pageNumber: number; imageUrl?: string }) => {
    const url = formInstance.getFieldValue('imageUrl');
    if (!url) {
      message.warning('Please upload an image first');
      return;
    }
    onAddPage({ pageNumber: values.pageNumber, imageUrl: url });
    formInstance.resetFields();
    setModalOpen(false);
  };

  return (
    <React.Fragment>
      {messageHolder}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2">Pages</h3>
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          {pages
            ?.sort((a, b) => a.pageNumber - b.pageNumber)
            ?.map((page) => (
              <button
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                className={`
                  relative flex items-center gap-3 p-2 rounded-lg border-2 transition-all cursor-pointer w-full text-left
                  ${activePageId === page.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={page.imageUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/not_found.jpg';
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {page.pageNumber}
                </span>
              </button>
            ))}
        </div>
        <Button
          type="dashed"
          className="mt-2"
          block
          onClick={() => {
            formInstance.resetFields();
            setModalOpen(true);
          }}
        >
          + Add Page
        </Button>
      </div>

      <Modal
        title="Add Page"
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={formInstance}
          layout="vertical"
          onFinish={(values) => handleAddPage(values as { pageNumber: number })}
          validateMessages={{ required: '${label} is required!' }}
        >
          <Form.Item
            name="pageNumber"
            label="Page Number"
            rules={[{ required: true, message: 'Page number is required!' }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="Page Image"
            rules={[{ required: true, message: 'Page image is required!' }]}
          >
            <CustomUploader
              listType="picture-card"
              maxCount={1}
              maxImageSizeKB={3072}
              sizeLimit={50}
              acceptedTypes={['jpg', 'jpeg', 'png', 'webp']}
              onChange={(urls) => {
                if (urls.length > 0) {
                  formInstance.setFieldValue('imageUrl', urls[0]);
                }
              }}
            />
          </Form.Item>
          <Form.Item className="!mb-0 text-right">
            <Button onClick={() => setModalOpen(false)} className="mr-2">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isAddingPage}>
              Add Page
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default PageList;
