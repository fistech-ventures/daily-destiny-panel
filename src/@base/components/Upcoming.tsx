import { ImagePaths } from '@lib/constant';
import { cn } from '@lib/utils';
import Image from 'next/image';

interface IProps {
  className?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const Upcoming: React.FC<IProps> = ({
  className,
  title = 'Coming Soon',
  subtitle = 'Working on something amazing!',
  description = 'Stay tuned for exciting new features and improvements.',
  imageWidth = 500,
  imageHeight = 300,
}) => {
  return (
    <div className={cn('text-center', className)}>
      <Image
        src={ImagePaths.upcoming}
        alt="Coming Soon"
        width={imageWidth}
        height={imageHeight}
        className="mx-auto mb-4"
      />
      <p className="text-4xl font-bold text-gray-700 mb-4">{title}</p>
      <p className="text-xl text-gray-500 mb-6">{subtitle}</p>
      <div className="max-w-md mx-auto">
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default Upcoming;
