import CustomUploader from "@base/components/CustomUploader";
import { IEpaperBulkUploadPayload } from "@modules/epapers/lib/interfaces";
import { Button, Col, DatePicker, Form, FormInstance, Row } from "antd";
import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import dayjs from "dayjs";

interface IProps {
  isLoading: boolean;
  form: FormInstance;
  onFinish: (values: IEpaperBulkUploadPayload) => void;
}

interface PageFormData {
  pageNumber: number;
  title: string;
  imageUrl?: string;
  imageKey?: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
  mimetype?: string;
  extension?: string;
  fileSize?: number;
}

const EpapersBulkUploadForm: React.FC<IProps> = ({
  isLoading,
  form,
  onFinish,
}) => {
  const [pages, setPages] = useState<PageFormData[]>([
    { pageNumber: 1, title: "" },
  ]);

  const addPage = () => {
    const newPageNumber = pages.length + 1;
    setPages([...pages, { pageNumber: newPageNumber, title: "" }]);
  };

  const removePage = (index: number) => {
    if (pages.length > 1) {
      const updatedPages = pages.filter((_, i) => i !== index);
      // Renumber pages
      const renumberedPages = updatedPages.map((page, i) => ({
        ...page,
        pageNumber: i + 1,
      }));
      setPages(renumberedPages);
    }
  };

  const handlePageChange = <K extends keyof PageFormData>(
    index: number,
    field: K,
    value: PageFormData[K],
  ) => {
    const updatedPages = [...pages];
    updatedPages[index][field] = value;
    setPages(updatedPages);
  };

  const handleSubmit = (values: any) => {
    const payload: IEpaperBulkUploadPayload = {
      date: dayjs(values.date).format("YYYY-MM-DD"),
      publicationName: "Daily Destiny",
      pages: pages.map((page) => ({
        pageNumber: page.pageNumber,
        imageUrl: page.imageUrl || "",
        imageKey: page.imageKey || "",
        thumbnailUrl: page.thumbnailUrl || "",
        thumbnailKey: page.thumbnailKey || "",
        title: page.title || `Page ${page.pageNumber}`,
        mimetype: page.mimetype || "image/jpeg",
        extension: page.extension || "jpg",
        fileSize: page.fileSize || 0,
      })),
    };
    onFinish(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ date: dayjs() }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Form.Item
            name="date"
            rules={[{ required: true, message: "Date is required!" }]}
            className="!mb-0"
          >
            <DatePicker placeholder="Date" className="w-full" />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Pages</h3>
            <Button type="dashed" icon={<FaPlus />} onClick={addPage}>
              Add Page
            </Button>
          </div>
        </Col>

        {pages.map((page, index) => (
          <Col xs={24} key={index}>
            <div className="border border-gray-300 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Page {page.pageNumber}</h4>
                {pages.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<FaTrash />}
                    onClick={() => removePage(index)}
                    size="small"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) =>
                      handlePageChange(index, "title", e.target.value)
                    }
                    placeholder={`Page ${page.pageNumber} Title`}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </Col>

                <Col xs={24}>
                  <label className="block text-sm font-medium mb-1">
                    E-Paper Image
                  </label>
                  <CustomUploader
                    listType="picture-card"
                    maxCount={1}
                    acceptedTypes={['jpg', 'jpeg', 'png', 'webp']}
                    initialValues={page.imageUrl ? [page.imageUrl] : []}
                    onChange={(urls, data) => {
                      if (urls.length > 0) {
                        handlePageChange(index, "imageUrl", urls[0]);
                        handlePageChange(index, "imageKey", data?.[0]?.key || '');
                        handlePageChange(index, "mimetype", data?.[0]?.mimetype || "image/jpeg");
                        handlePageChange(index, "extension", data?.[0]?.extension || "jpg");
                        handlePageChange(index, "fileSize", data?.[0]?.fileSize || 0);
                      }
                    }}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        ))}

        <Col xs={24}>
          <Form.Item className="text-right !mb-0">
            <Button loading={isLoading} type="primary" htmlType="submit">
              Bulk Upload
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default EpapersBulkUploadForm;
