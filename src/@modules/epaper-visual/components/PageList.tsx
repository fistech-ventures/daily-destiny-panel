import CustomUploader from "@base/components/CustomUploader";
import { EpapersServices } from "@modules/epapers/lib/services";
import { Button, Form, InputNumber, Modal, Spin, Tabs, message } from "antd";
import React, { useEffect, useState } from "react";
import { CreatePagePayload } from "../lib/interfaces";

interface PageItem {
  id: string;
  pageNumber: number;
  imageUrl: string;
}

interface ExistingPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  title: string;
}

interface IProps {
  pages: PageItem[];
  activePageId: string | null;
  onSelectPage: (pageId: string) => void;
  onAddPage: (payload: CreatePagePayload) => void;
  isAddingPage: boolean;
  editionDate?: string;
}

const PageList: React.FC<IProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  isAddingPage,
  editionDate,
}) => {
  const [, messageHolder] = message.useMessage();
  const [isModalOpen, setModalOpen] = useState(false);
  const [formInstance] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [existingPages, setExistingPages] = useState<ExistingPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [selectedExistingPage, setSelectedExistingPage] = useState<ExistingPage | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setActiveTab("upload");
      setSelectedExistingPage(null);
      setExistingPages([]);
    }
  }, [isModalOpen]);

  // Fetch existing epapers when tab switches to "existing" and editionDate is available
  useEffect(() => {
    if (activeTab === "existing" && editionDate && isModalOpen) {
      fetchExistingEpapers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, editionDate, isModalOpen]);

  const fetchExistingEpapers = async () => {
    if (!editionDate) return;

    setIsLoadingPages(true);
    try {
      const res = await EpapersServices.findPagesByDate(editionDate, "Daily Destiny");
      const data = res?.data || [];
      setExistingPages(
        data.map((ep: any) => ({
          id: ep.id,
          pageNumber: ep.pageNumber,
          imageUrl: ep.imageUrl,
          title: ep.title || `Page ${ep.pageNumber}`,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch existing e-papers:", err);
      message.warning("Could not load existing e-papers. The date may not have any uploaded pages.");
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleAddPage = (values: { pageNumber: number; imageUrl?: string }) => {
    let url: string | undefined;

    if (activeTab === "existing" && selectedExistingPage) {
      url = selectedExistingPage.imageUrl;
      // Auto-fill pageNumber from the selected page
      values.pageNumber = selectedExistingPage.pageNumber;
    } else {
      url = formInstance.getFieldValue("imageUrl");
    }

    if (!url) {
      message.warning(
        activeTab === "existing"
          ? "Please select an e-paper page first"
          : "Please upload an image first",
      );
      return;
    }
    onAddPage({ pageNumber: values.pageNumber, imageUrl: url });
    formInstance.resetFields();
    setModalOpen(false);
  };

  // Determine already-added page numbers to avoid duplicates
  const existingPageNumbers = new Set(pages.map((p) => p.pageNumber));

  return (
    <React.Fragment>
      {messageHolder}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2">
          Pages
        </h3>
        <div
          className="flex flex-col gap-2 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          {pages
            ?.sort((a, b) => a.pageNumber - b.pageNumber)
            ?.map((page) => (
              <button
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                className={`
                  relative flex items-center gap-3 p-2 rounded-lg border-2 transition-all cursor-pointer w-full text-left
                  ${
                    activePageId === page.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-transparent hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }
                `}
              >
                <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={page.imageUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/not_found.jpg";
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
        width={520}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "upload",
              label: "Upload New",
              children: (
                <Form
                  form={formInstance}
                  layout="vertical"
                  onFinish={(values) => handleAddPage(values as { pageNumber: number })}
                  validateMessages={{ required: "${label} is required!" }}
                >
                  <Form.Item
                    name="pageNumber"
                    label="Page Number"
                    rules={[{ required: true, message: "Page number is required!" }]}
                  >
                    <InputNumber className="w-full" min={1} />
                  </Form.Item>
                  <Form.Item
                    name="imageUrl"
                    label="Page Image"
                    rules={[{ required: true, message: "Page image is required!" }]}
                  >
                    <CustomUploader
                      listType="picture-card"
                      maxCount={1}
                      maxImageSizeKB={10240}
                      sizeLimit={50}
                      acceptedTypes={["jpg", "jpeg", "png", "webp"]}
                      onChange={(urls) => {
                        if (urls.length > 0) {
                          formInstance.setFieldValue("imageUrl", urls[0]);
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item className="!mb-0 text-right">
                    <Button onClick={() => setModalOpen(false)} className="mr-2">
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isAddingPage}>
                      Add Page
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "existing",
              label: "From E-Papers",
              disabled: !editionDate,
              children: (
                <div>
                  {editionDate && (
                    <p className="text-xs text-gray-500 mb-3">
                      Select from e-papers uploaded for{" "}
                      <span className="font-medium">{editionDate}</span>
                    </p>
                  )}
                  {!editionDate && (
                    <p className="text-sm text-amber-600 mb-3">
                      Save the edition with a publish date first to see existing e-papers.
                    </p>
                  )}

                  {isLoadingPages ? (
                    <div className="flex justify-center py-8">
                      <Spin />
                    </div>
                  ) : existingPages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No e-papers found for this date.</p>
                      <p className="text-xs mt-1">Upload e-papers via the E-Papers section first.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 mb-4 max-h-72 overflow-y-auto">
                      {existingPages
                        .filter((ep) => !existingPageNumbers.has(ep.pageNumber))
                        .map((ep) => (
                          <button
                            key={ep.id}
                            type="button"
                            className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all cursor-pointer ${
                              selectedExistingPage?.id === ep.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 hover:border-blue-300 dark:border-gray-600 dark:hover:border-blue-400"
                            }`}
                            onClick={() => setSelectedExistingPage(ep)}
                          >
                            <div className="w-full aspect-[3/4] rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <img
                                src={ep.imageUrl}
                                alt={ep.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/images/not_found.jpg";
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate w-full text-center">
                              {ep.title}
                            </span>
                          </button>
                        ))}

                      {existingPages.filter((ep) => !existingPageNumbers.has(ep.pageNumber)).length === 0 && (
                        <div className="col-span-3 text-center py-6 text-gray-400">
                          <p className="text-sm">All e-paper pages have already been added.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-right flex gap-2 justify-end">
                    <Button onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      loading={isAddingPage}
                      disabled={!selectedExistingPage}
                      onClick={() => {
                        if (selectedExistingPage) {
                          onAddPage({
                            pageNumber: selectedExistingPage.pageNumber,
                            imageUrl: selectedExistingPage.imageUrl,
                          });
                          formInstance.resetFields();
                          setModalOpen(false);
                        }
                      }}
                    >
                      Add Selected Page
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </React.Fragment>
  );
};

export default PageList;
