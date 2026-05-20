'use client';

import { cn } from '@base/components/RichTextEditor/lib/tiptap-utils';
import '@base/components/RichTextEditor/components/tiptap-ui-primitive/input/input.scss';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return <input type={type} data-slot="tiptap-input" className={cn('tiptap-input', className)} {...props} />;
}

export { Input };
