import { useState } from 'react';

const useCopyClipboard = (resetDelay = 2000) => {
  const [isCopied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => setCopied(false), resetDelay);
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);
      setCopied(false);
    }
  };

  return { isCopied, copyToClipboard };
};

export default useCopyClipboard;
