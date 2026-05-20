import { Env } from '.environments';
import { ENUM_API_SCOPE_TYPES } from '@lib/interfaces/apiScope.interface';
import { Toolbox } from '@lib/utils';
import { getAuthToken } from '@modules/auth/lib/utils/client';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { Button, Image, message, Progress, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlinePlus, AiOutlineUpload } from 'react-icons/ai';
import { compressFile, isImageFile, isVideoFile } from '@base/utils/fileCompression';

type TFile = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface IBaseProps {
  isCrop?: boolean;
  isDisable?: boolean;
  isPreview?: boolean;
  sizeLimit?: number;
  acceptedTypes?: string[];
  maxCount?: number;
  initialValues?: string[];
  onChange?: (urls: string[], data?: any[]) => void;
  actionPath?: string;
  enableCompression?: boolean;
  maxImageSizeKB?: number;
  maxVideoWidth?: number;
  maxVideoHeight?: number;
  videoBitrate?: number;
}

interface IBasePropsWithIC extends IBaseProps {
  listType?: 'text' | 'picture';
  innerContent: React.ReactNode;
}

interface IBasePropsWithoutIC extends IBaseProps {
  listType: 'button' | 'picture-card' | 'picture-circle';
  innerContent?: React.ReactNode;
}

type TProps = IBasePropsWithIC | IBasePropsWithoutIC;

const CustomUploader: React.FC<TProps> = ({
  isCrop = false,
  isDisable = false,
  isPreview = true,
  sizeLimit = 10,
  acceptedTypes = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'webm', 'mp4', 'avi', 'mov'],
  maxCount = 1,
  initialValues,
  listType = 'text',
  innerContent,
  onChange,
  actionPath,
  enableCompression = true,
  maxImageSizeKB = 132,
  maxVideoWidth = 1280,
  maxVideoHeight = 720,
  videoBitrate = 1000000,
}) => {
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const lastUrlsRef = useRef<string[]>([]);

  const extractUrlsFn = (files: UploadFile[]) => {
    return files.map((file) => file.url || file.response?.data?.[0]?.url).filter(Boolean);
  };

  const imgCropBeforeUploadFn = (file: TFile) => {
    return Toolbox.acceptFileTypes(file, ['jpg', 'jpeg', 'png', 'webp']);
  };

  const beforeUploadFn = async (file: TFile) => {
    const isAccept = Toolbox.acceptFileTypes(file, acceptedTypes);
    const isLimit = file.size / 1024 / 1024 < sizeLimit;

    if (!isAccept) {
      message.error(`You can only upload ${acceptedTypes.join('/')} file!`);
      return false;
    }
    if (!isLimit) {
      message.error(`File must be smaller than ${sizeLimit}MB!`);
      return false;
    }

    // Apply compression if enabled and file is media
    if (enableCompression && (isImageFile(file) || isVideoFile(file))) {
      try {
        setIsCompressing(true);
        setCompressionProgress(0);

        const compressedFile = await compressFile(
          file,
          { maxSizeKB: maxImageSizeKB },
          {
            maxWidth: maxVideoWidth,
            maxHeight: maxVideoHeight,
            bitrate: videoBitrate,
          },
          (progress) => setCompressionProgress(progress),
        );

        // Replace the original file with compressed one
        Object.defineProperty(file, 'size', { value: compressedFile.size });
        Object.defineProperty(file, 'type', { value: compressedFile.type });
        Object.defineProperty(file, 'name', { value: compressedFile.name });

        // Create a new File object with the compressed data
        const finalFile = new File([compressedFile], compressedFile.name, {
          type: compressedFile.type,
          lastModified: Date.now(),
        });

        setCompressionProgress(100);
        setTimeout(() => {
          setIsCompressing(false);
          setCompressionProgress(0);
        }, 1000);

        return finalFile;
      } catch (error) {
        console.error('Compression failed:', error);
        message.error('File compression failed, uploading original file');
        setIsCompressing(false);
        setCompressionProgress(0);
        return file;
      }
    }

    return file;
  };

  const onPreviewFn = async (file: UploadFile) => {
    const url = file.url || file.response?.data?.[0]?.url;

    if (!url) {
      message.error('No preview available');
      return;
    }

    setPreviewImage(url);
    setPreviewOpen(true);
  };

  const onRemoveFn = (file: UploadFile) => {
    const remainingFileList = fileList.filter((f) => f.uid !== file.uid);

    setFileList(remainingFileList);
    const urls = extractUrlsFn(remainingFileList);

    if (JSON.stringify(urls) !== JSON.stringify(lastUrlsRef.current)) {
      lastUrlsRef.current = urls;
      const dataObjects = remainingFileList.map((file) => file.response?.data?.[0] || { url: file.url });
      onChange?.(urls, dataObjects);
    }
  };

  const handleChangeFn: UploadProps['onChange'] = ({ fileList }) => {
    const purifiedFileList = fileList.map((file) => {
      if (!file.response && file.status !== 'uploading' && file.status !== 'done') {
        return { ...file, status: 'error' };
      }

      return {
        ...file,
        url: file.url || file.response?.data?.[0]?.url,
      };
    });

    setFileList(purifiedFileList as any);

    const sanitizedFileList = purifiedFileList.every((file) => file.status === 'done');

    if (sanitizedFileList) {
      const urls = extractUrlsFn(purifiedFileList as any);

      if (JSON.stringify(urls) !== JSON.stringify(lastUrlsRef.current)) {
        lastUrlsRef.current = urls;
        const dataObjects = purifiedFileList.map((file) => file.response?.data?.[0] || { url: file.url });
        onChange?.(urls, dataObjects);
      }
    }
  };

  useEffect(() => {
    if (Toolbox.isEmpty(initialValues?.filter(Boolean))) {
      setFileList([]);
      return;
    }

    const purifiedFileList = initialValues.map((url, idx) => ({
      uid: `-${idx}`,
      name: `file-${idx}`,
      status: 'done',
      url,
    }));

    setFileList(purifiedFileList as any);
    lastUrlsRef.current = initialValues;
  }, [initialValues]);

  return (
    <React.Fragment>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: isPreviewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(null),
          }}
          src={previewImage}
          alt="Preview"
        />
      )}
      {isCompressing && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Compressing file...</div>
          <Progress percent={Math.round(compressionProgress)} size="small" />
        </div>
      )}
      <ImgCrop
        showReset
        rotationSlider
        aspectSlider
        quality={1}
        maxZoom={5}
        beforeCrop={(file) => {
          if (!isCrop || maxCount > 1) return false;
          return imgCropBeforeUploadFn(file);
        }}
      >
        <Upload
          name="files"
          headers={{ Authorization: `Bearer ${getAuthToken()}` }}
          accept={acceptedTypes.map((acceptedType) => `.${acceptedType}`).join(',')}
          fileList={fileList}
          listType={listType === 'button' ? 'text' : listType}
          maxCount={maxCount}
          disabled={isDisable}
          multiple={maxCount > 1}
          showUploadList={{ showPreviewIcon: isPreview }}
          action={`${Env.apiUrl.replace('{{scope}}', ENUM_API_SCOPE_TYPES.INTERNAL)}/${actionPath ?? 'files'}`}
          beforeUpload={beforeUploadFn}
          onChange={handleChangeFn}
          onRemove={onRemoveFn}
          onPreview={onPreviewFn}
        >
          {fileList.length < maxCount &&
            (listType === 'button' ? (
              <Button type="primary" icon={<AiOutlineUpload />} disabled={isDisable}>
                {innerContent || 'Click to Upload'}
              </Button>
            ) : (
              innerContent || (
                <div className="flex flex-col items-center gap-2">
                  <AiOutlinePlus />
                  <p>Upload</p>
                </div>
              )
            ))}
        </Upload>
      </ImgCrop>
    </React.Fragment>
  );
};

export default CustomUploader;
