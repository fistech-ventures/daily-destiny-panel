import { cn } from '@lib/utils';
import { Button, type TagType } from 'antd';
import type { ClassValue } from 'clsx';
import React from 'react';
import { IoArrowBackSharp } from 'react-icons/io5';

export interface IProps {
  className?: ClassValue;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  tags?: React.ReactElement<TagType>[];
  extra?: React.ReactNode;
  onBack?: (e?: React.MouseEvent<HTMLElement>) => void;
}

const PageHeader: React.FC<IProps> = ({ className, title, subTitle, tags, extra, onBack }) => {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 md:gap-4 mb-4 pb-4 border-b border-gray-200',
        'page_header',
        className,
      )}
    >
      {onBack && (
        <Button onClick={onBack}>
          <IoArrowBackSharp size={18} />
        </Button>
      )}
      {title && (typeof title === 'string' ? <h2 className="text-xl font-semibold title">{title}</h2> : title)}
      {subTitle && (typeof subTitle === 'string' ? <p className="subtitle">{subTitle}</p> : subTitle)}
      {tags}
      {extra && <div className="flex flex-wrap items-center gap-4 md:ml-auto extra">{extra}</div>}
    </div>
  );
};

export default PageHeader;
