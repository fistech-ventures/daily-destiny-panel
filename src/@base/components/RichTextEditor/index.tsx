'use client';

import { SimpleEditor } from '@base/components/RichTextEditor/components/tiptap-templates/simple/simple-editor';
import React from 'react';

interface IProps {
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const RichTextEditor: React.FC<IProps> = ({
  disabled = false,
  placeholder = 'Start writing...',
  value = '',
  onChange,
}) => {
  return <SimpleEditor placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} />;
};

export default RichTextEditor;
