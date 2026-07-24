import React from 'react';
import AdBanner from './AdBanner';
import { useAdsByPage } from '../lib/useAdsByPage';

interface AdSectionProps {
  pageType: string;
  position: string;
  className?: string;
}

const AdSection: React.FC<AdSectionProps> = ({ pageType, position, className = '' }) => {
  const { adsByPosition } = useAdsByPage(pageType, 'true');
  const ad = adsByPosition[position]?.[0];

  if (!ad) return null;

  return <AdBanner ad={ad} className={className} />;
};

export default AdSection;
