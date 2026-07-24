import React from 'react';
import { IAd } from '../lib/interfaces';
import { ENUM_ADS_TYPES } from '../lib/enums';

interface AdBannerProps {
  ad: IAd;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ ad, className = '' }) => {
  if (!ad) return null;

  const renderAdContent = () => {
    switch (ad.type) {
      case ENUM_ADS_TYPES.IMAGE:
        return (
          <a href={ad.redirectUrl} target="_blank" rel="noopener noreferrer">
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto" />
          </a>
        );

      case ENUM_ADS_TYPES.VIDEO:
        return (
          <video src={ad.videoUrl} controls className="w-full h-auto">
            Your browser does not support the video tag.
          </video>
        );

      case ENUM_ADS_TYPES.EMBEDDED:
        return <div dangerouslySetInnerHTML={{ __html: ad.scriptEmbedCode }} />;

      case ENUM_ADS_TYPES.ANIMATION:
        return (
          <a href={ad.redirectUrl} target="_blank" rel="noopener noreferrer">
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto" />
          </a>
        );

      default:
        return null;
    }
  };

  return <div className={`ad-banner ${className}`}>{renderAdContent()}</div>;
};

export default AdBanner;
