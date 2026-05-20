'use client';

import { Extension } from '@tiptap/core';
import { EditorContent, EditorContext, useEditor, type Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// --- Tiptap Core Extensions ---
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Typography } from '@tiptap/extension-typography';
import { Placeholder, Selection } from '@tiptap/extensions';
import { StarterKit } from '@tiptap/starter-kit';

// --- UI Primitives ---
import { Button } from '@base/components/RichTextEditor/components/tiptap-ui-primitive/button';
import { Spacer } from '@base/components/RichTextEditor/components/tiptap-ui-primitive/spacer';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@base/components/RichTextEditor/components/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import '@base/components/RichTextEditor/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@base/components/RichTextEditor/components/tiptap-node/code-block-node/code-block-node.scss';
import '@base/components/RichTextEditor/components/tiptap-node/heading-node/heading-node.scss';
import { HorizontalRule } from '@base/components/RichTextEditor/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import '@base/components/RichTextEditor/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@base/components/RichTextEditor/components/tiptap-node/image-node/image-node.scss';
import { ImageUploadNode } from '@base/components/RichTextEditor/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@base/components/RichTextEditor/components/tiptap-node/list-node/list-node.scss';
import '@base/components/RichTextEditor/components/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { BlockquoteButton } from '@base/components/RichTextEditor/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@base/components/RichTextEditor/components/tiptap-ui/code-block-button';
import { ColorHighlightPopoverContent } from '@base/components/RichTextEditor/components/tiptap-ui/color-highlight-popover';
import { HeadingDropdownMenu } from '@base/components/RichTextEditor/components/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@base/components/RichTextEditor/components/tiptap-ui/image-upload-button';
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from '@base/components/RichTextEditor/components/tiptap-ui/link-popover';
import { ListDropdownMenu } from '@base/components/RichTextEditor/components/tiptap-ui/list-dropdown-menu';
import { MarkButton } from '@base/components/RichTextEditor/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@base/components/RichTextEditor/components/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@base/components/RichTextEditor/components/tiptap-ui/undo-redo-button';

// --- Icons ---
import { ArrowLeftIcon } from '@base/components/RichTextEditor/components/tiptap-icons/arrow-left-icon';
import { ChevronDownIcon } from '@base/components/RichTextEditor/components/tiptap-icons/chevron-down-icon';
import { HighlighterIcon } from '@base/components/RichTextEditor/components/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@base/components/RichTextEditor/components/tiptap-icons/link-icon';
import { TrashIcon } from '@base/components/RichTextEditor/components/tiptap-icons/trash-icon';

// --- Hooks ---
import { useCursorVisibility } from '@base/components/RichTextEditor/hooks/use-cursor-visibility';
import { useIsBreakpoint } from '@base/components/RichTextEditor/hooks/use-is-breakpoint';
import { useTiptapEditor } from '@base/components/RichTextEditor/hooks/use-tiptap-editor';
import { useWindowSize } from '@base/components/RichTextEditor/hooks/use-window-size';

// --- Components ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@base/components/RichTextEditor/components/tiptap-ui-primitive/dropdown-menu';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@base/components/RichTextEditor/lib/tiptap-utils';

// --- Styles ---
import { NodeBackground } from '@base/components/RichTextEditor/components/tiptap-extension/node-background-extension';
import '@base/components/RichTextEditor/components/tiptap-templates/simple/simple-editor.scss';
import { message } from 'antd';

interface SimpleEditorProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const getSelectionTextStyleAttr = (editor: Editor, attr: 'color' | 'fontSize'): string | 'mixed' | null => {
  const { from, to, empty } = editor.state.selection;
  if (empty) {
    return (editor.getAttributes('textStyle')?.[attr] as string) || null;
  }

  const values = new Set<string>();
  editor.state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return;
    const textStyle = node.marks.find((mark) => mark.type.name === 'textStyle');
    const value = textStyle?.attrs?.[attr];
    values.add(value ? String(value) : '__none__');
  });

  if (values.size === 0) return null;
  if (values.size > 1) return 'mixed';
  const [only] = Array.from(values);
  return only === '__none__' ? null : only;
};

const getSelectionHighlightAttr = (editor: Editor): string | 'mixed' | null => {
  const { from, to, empty } = editor.state.selection;
  if (empty) {
    return (editor.getAttributes('highlight')?.color as string) || null;
  }

  const values = new Set<string>();
  editor.state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return;
    const highlight = node.marks.find((mark) => mark.type.name === 'highlight');
    const value = highlight?.attrs?.color;
    values.add(value ? String(value) : '__none__');
  });

  if (values.size === 0) return null;
  if (values.size > 1) return 'mixed';
  const [only] = Array.from(values);
  return only === '__none__' ? null : only;
};

const TEXT_COLORS = [
  { label: 'Black', value: '#141414' },
  { label: 'Gray', value: '#595959' },
  { label: 'Blue', value: '#1677ff' },
  { label: 'Green', value: '#52c41a' },
  { label: 'Orange', value: '#fa541c' },
  { label: 'Red', value: '#d4380d' },
  { label: 'Purple', value: '#722ed1' },
] as const;
const BG_COLORS = [
  { label: 'Yellow', value: '#fff1b8' },
  { label: 'Light Green', value: '#d9f7be' },
  { label: 'Light Blue', value: '#bae7ff' },
  { label: 'Light Pink', value: '#ffd6e7' },
  { label: 'Light Purple', value: '#efdbff' },
] as const;

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: { chain: () => any }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => any }) => {
          return chain().setMark('textStyle', { fontSize: null }).run();
        },
    } as Record<string, any>;
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: { fontSize?: string | null }) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-width') || element.style.width || '100%',
        renderHTML: (attributes: { width?: string }) => ({
          'data-width': attributes.width || '100%',
          style: `width: ${attributes.width || '100%'}; height: auto;`,
        }),
      },
      align: {
        default: 'center',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes: { align?: string }) => ({
          'data-align': attributes.align || 'center',
          style: `width: ${(attributes as any).width || '100%'}; height: auto; display: block; ${
            attributes.align === 'left'
              ? 'margin-left: 0; margin-right: auto;'
              : attributes.align === 'right'
                ? 'margin-left: auto; margin-right: 0;'
                : 'margin-left: auto; margin-right: auto;'
          }`,
        }),
      },
    };
  },
});

const ImageResizeControls = ({ editor }: { editor: Editor | null }) => {
  const { editor: currentEditor } = useTiptapEditor(editor);
  const [isImageActive, setIsImageActive] = useState(false);
  const [currentWidth, setCurrentWidth] = useState('100%');

  const syncImageState = useCallback(() => {
    if (!currentEditor) return;
    const active = currentEditor.isActive('image');
    setIsImageActive(active);
    if (active) {
      const width = (currentEditor.getAttributes('image')?.width as string) || '100%';
      setCurrentWidth(width);
    }
  }, [currentEditor]);

  useEffect(() => {
    if (!currentEditor) return;
    syncImageState();
    currentEditor.on('selectionUpdate', syncImageState);
    currentEditor.on('transaction', syncImageState);
    return () => {
      currentEditor.off('selectionUpdate', syncImageState);
      currentEditor.off('transaction', syncImageState);
    };
  }, [currentEditor, syncImageState]);

  if (!currentEditor || !isImageActive) return null;

  const setImageWidth = (width: string) => {
    currentEditor.chain().focus().updateAttributes('image', { width }).run();
  };

  const setImageAlign = (align: 'left' | 'center' | 'right') => {
    currentEditor.chain().focus().updateAttributes('image', { align }).run();
  };

  const currentAlign = (currentEditor.getAttributes('image')?.align as 'left' | 'center' | 'right') || 'center';

  return (
    <ToolbarGroup>
      <Button
        type="button"
        variant="ghost"
        data-active-state={currentWidth === '33%' ? 'on' : 'off'}
        onClick={() => setImageWidth('33%')}
        tooltip="Image small"
      >
        S
      </Button>
      <Button
        type="button"
        variant="ghost"
        data-active-state={currentWidth === '50%' ? 'on' : 'off'}
        onClick={() => setImageWidth('50%')}
        tooltip="Image medium"
      >
        M
      </Button>
      <Button
        type="button"
        variant="ghost"
        data-active-state={currentWidth === '75%' ? 'on' : 'off'}
        onClick={() => setImageWidth('75%')}
        tooltip="Image large"
      >
        L
      </Button>
      <Button
        type="button"
        variant="ghost"
        data-active-state={currentWidth === '100%' ? 'on' : 'off'}
        onClick={() => setImageWidth('100%')}
        tooltip="Image full"
      >
        F
      </Button>
      <ToolbarSeparator />
      <Button
        type="button"
        variant="ghost"
        data-active-state={currentAlign === 'left' ? 'on' : 'off'}
        onClick={() => setImageAlign('left')}
        tooltip="Image align left"
      >
        Left
      </Button>
      <Button
        type="button"
        variant="ghost"
        data-active-state={currentAlign === 'center' ? 'on' : 'off'}
        onClick={() => setImageAlign('center')}
        tooltip="Image align center"
      >
        Center
      </Button>
      <Button
        type="button"
        variant="ghost"
        data-active-state={currentAlign === 'right' ? 'on' : 'off'}
        onClick={() => setImageAlign('right')}
        tooltip="Image align right"
      >
        Right
      </Button>
    </ToolbarGroup>
  );
};

const ExpandIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 3H3v5" />
    <path d="M16 3h5v5" />
    <path d="M3 16v5h5" />
    <path d="M21 16v5h-5" />
  </svg>
);

const CollapseIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 3H3v6" />
    <path d="M15 3h6v6" />
    <path d="M3 15v6h6" />
    <path d="M21 15v6h-6" />
  </svg>
);

const FontSizeDropdown = ({ editor }: { editor: Editor | null }) => {
  const { editor: currentEditor } = useTiptapEditor(editor);
  const getCurrentSize = useCallback(() => {
    if (!currentEditor) return '16';
    const selectionValue = getSelectionTextStyleAttr(currentEditor, 'fontSize');
    if (selectionValue === 'mixed') return 'Mixed';
    const raw = selectionValue || undefined;
    const parsed = raw ? Number.parseInt(raw.replace('px', ''), 10) : 16;
    return Number.isFinite(parsed) ? String(parsed) : '16';
  }, [currentEditor]);
  const [currentSize, setCurrentSize] = useState<string>(getCurrentSize());
  const syncCurrentSize = useCallback(() => setCurrentSize(getCurrentSize()), [getCurrentSize]);

  const applyFontSize = (nextSize: number) => {
    if (!currentEditor) return;
    const bounded = Math.max(12, Math.min(48, nextSize));
    currentEditor.chain().focus().setFontSize(`${bounded}px`).run();
    syncCurrentSize();
  };

  useEffect(() => {
    if (!currentEditor) return;
    syncCurrentSize();
    currentEditor.on('selectionUpdate', syncCurrentSize);
    currentEditor.on('transaction', syncCurrentSize);
    currentEditor.on('update', syncCurrentSize);
    return () => {
      currentEditor.off('selectionUpdate', syncCurrentSize);
      currentEditor.off('transaction', syncCurrentSize);
      currentEditor.off('update', syncCurrentSize);
    };
  }, [currentEditor, syncCurrentSize]);

  if (!currentEditor) return null;

  return (
    <div className="tiptap-font-size-control">
      <Button
        type="button"
        variant="ghost"
        onClick={() => applyFontSize((currentSize === 'mixed' ? 16 : Number(currentSize)) - 2)}
        aria-label="Decrease font size"
        tooltip="Decrease font size"
      >
        A-
      </Button>
      <span className="tiptap-font-size-value">{currentSize}</span>
      <Button
        type="button"
        variant="ghost"
        onClick={() => applyFontSize((currentSize === 'mixed' ? 16 : Number(currentSize)) + 2)}
        aria-label="Increase font size"
        tooltip="Increase font size"
      >
        A+
      </Button>
    </div>
  );
};

const TextColorDropdown = ({ editor }: { editor: Editor | null }) => {
  const { editor: currentEditor } = useTiptapEditor(editor);
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#1677ff');
  const getCurrentColor = useCallback(() => {
    if (!currentEditor) return 'default';
    const selectionColor = getSelectionTextStyleAttr(currentEditor, 'color');
    return selectionColor ?? 'default';
  }, [currentEditor]);
  const [currentColor, setCurrentColor] = useState<string>(getCurrentColor());
  const syncCurrentColor = useCallback(() => setCurrentColor(getCurrentColor()), [getCurrentColor]);

  useEffect(() => {
    if (!currentEditor) return;
    syncCurrentColor();
    currentEditor.on('selectionUpdate', syncCurrentColor);
    currentEditor.on('transaction', syncCurrentColor);
    currentEditor.on('update', syncCurrentColor);
    return () => {
      currentEditor.off('selectionUpdate', syncCurrentColor);
      currentEditor.off('transaction', syncCurrentColor);
      currentEditor.off('update', syncCurrentColor);
    };
  }, [currentEditor, syncCurrentColor]);

  if (!currentEditor) return null;
  const isActive = currentColor !== 'default';
  const isMixedOrDefault = currentColor === 'default' || currentColor === 'mixed';
  const applyCustomColor = () => {
    if (!/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(customColor)) return;
    currentEditor.chain().focus().setColor(customColor).run();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-active-state={isActive ? 'on' : 'off'}
          aria-label="Text color"
          tooltip="Text color"
        >
          <span className="tiptap-button-text">A</span>
          <span
            className={`tiptap-color-indicator ${isMixedOrDefault ? 'is-default' : ''}`}
            style={{ backgroundColor: isMixedOrDefault ? 'transparent' : currentColor }}
          />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={currentColor === 'mixed' ? 'mixed' : currentColor}
          onValueChange={(next) =>
            next === 'default'
              ? currentEditor.chain().focus().unsetColor().run()
              : currentEditor.chain().focus().setColor(next).run()
          }
        >
          <DropdownMenuGroup className="tiptap-color-grid">
            {currentColor === 'mixed' && <DropdownMenuRadioItem value="mixed">Mixed</DropdownMenuRadioItem>}
            {TEXT_COLORS.map((color) => (
              <DropdownMenuRadioItem
                key={color.value}
                value={color.value}
                onSelect={() => currentEditor.chain().focus().setColor(color.value).run()}
              >
                <span className="tiptap-color-swatch" style={{ backgroundColor: color.value }} />
                <span className="tiptap-color-name">{color.label}</span>
              </DropdownMenuRadioItem>
            ))}
            <DropdownMenuRadioItem value="default" onSelect={() => currentEditor.chain().focus().unsetColor().run()}>
              <span className="tiptap-color-swatch tiptap-color-swatch-default" />
              <span className="tiptap-color-name">Default</span>
            </DropdownMenuRadioItem>
          </DropdownMenuGroup>
        </DropdownMenuRadioGroup>
        <div className="tiptap-color-custom-row">
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              currentEditor.chain().focus().setColor(e.target.value).run();
            }}
            className="tiptap-color-picker-input"
            aria-label="Pick text color"
            title="Pick text color"
          />
          <input
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="tiptap-color-custom-input"
            placeholder="#1677ff"
          />
          <Button type="button" variant="ghost" onClick={applyCustomColor}>
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const BgColorDropdown = ({ editor }: { editor: Editor | null }) => {
  const { editor: currentEditor } = useTiptapEditor(editor);
  const [isOpen, setIsOpen] = useState(false);
  const [customBg, setCustomBg] = useState('#fff1b8');
  const getCurrentBg = useCallback(() => {
    if (!currentEditor) return 'default';
    const selectionBg = getSelectionHighlightAttr(currentEditor);
    return selectionBg ?? 'default';
  }, [currentEditor]);
  const [currentBg, setCurrentBg] = useState<string>(getCurrentBg());
  const syncCurrentBg = useCallback(() => setCurrentBg(getCurrentBg()), [getCurrentBg]);

  useEffect(() => {
    if (!currentEditor) return;
    syncCurrentBg();
    currentEditor.on('selectionUpdate', syncCurrentBg);
    currentEditor.on('transaction', syncCurrentBg);
    currentEditor.on('update', syncCurrentBg);
    return () => {
      currentEditor.off('selectionUpdate', syncCurrentBg);
      currentEditor.off('transaction', syncCurrentBg);
      currentEditor.off('update', syncCurrentBg);
    };
  }, [currentEditor, syncCurrentBg]);

  if (!currentEditor) return null;
  const isActive = currentBg !== 'default';
  const isMixedOrDefault = currentBg === 'default' || currentBg === 'mixed';
  const applyCustomBg = () => {
    if (!/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(customBg)) return;
    currentEditor.chain().focus().setHighlight({ color: customBg }).run();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-active-state={isActive ? 'on' : 'off'}
          aria-label="Background color"
          tooltip="Background color"
        >
          <span className="tiptap-button-text">A</span>
          <span
            className={`tiptap-color-indicator ${isMixedOrDefault ? 'is-default' : ''}`}
            style={{ backgroundColor: isMixedOrDefault ? 'transparent' : currentBg }}
          />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup
          value={currentBg === 'mixed' ? 'mixed' : currentBg}
          onValueChange={(next) =>
            next === 'default'
              ? currentEditor.chain().focus().unsetHighlight().run()
              : currentEditor.chain().focus().setHighlight({ color: next }).run()
          }
        >
          <DropdownMenuGroup className="tiptap-color-grid">
            {currentBg === 'mixed' && <DropdownMenuRadioItem value="mixed">Mixed</DropdownMenuRadioItem>}
            {BG_COLORS.map((color) => (
              <DropdownMenuRadioItem
                key={color.value}
                value={color.value}
                onSelect={() => currentEditor.chain().focus().setHighlight({ color: color.value }).run()}
              >
                <span className="tiptap-color-swatch" style={{ backgroundColor: color.value }} />
                <span className="tiptap-color-name">{color.label}</span>
              </DropdownMenuRadioItem>
            ))}
            <DropdownMenuRadioItem
              value="default"
              onSelect={() => currentEditor.chain().focus().unsetHighlight().run()}
            >
              <span className="tiptap-color-swatch tiptap-color-swatch-default" />
              <span className="tiptap-color-name">Default</span>
            </DropdownMenuRadioItem>
          </DropdownMenuGroup>
        </DropdownMenuRadioGroup>
        <div className="tiptap-color-custom-row">
          <input
            type="color"
            value={customBg}
            onChange={(e) => {
              setCustomBg(e.target.value);
              currentEditor.chain().focus().setHighlight({ color: e.target.value }).run();
            }}
            className="tiptap-color-picker-input"
            aria-label="Pick background color"
            title="Pick background color"
          />
          <input
            value={customBg}
            onChange={(e) => setCustomBg(e.target.value)}
            className="tiptap-color-custom-input"
            placeholder="#fff1b8"
          />
          <Button type="button" variant="ghost" onClick={applyCustomBg}>
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MainToolbarContent = ({
  editor,
  // onHighlighterClick,
  onLinkClick,
  isMobile,
  onToggleFullscreen,
  isFullscreen,
}: {
  editor: Editor | null;
  // onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}) => {
  const clearFormatting = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .unsetColor()
      .unsetHighlight()
      .unsetAllMarks()
      .clearNodes()
      .setMark('textStyle', { fontSize: null })
      .run();
  };

  return (
    <>
      {/* <Spacer /> */}

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu modal={false} types={['bulletList', 'orderedList', 'taskList']} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {/* {!isMobile ? (
          <ColorHighlightPopover editor={editor} hideWhenUnavailable onApplied={() => undefined} />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )} */}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <FontSizeDropdown editor={editor} />
        <TextColorDropdown editor={editor} />
        <BgColorDropdown editor={editor} />
        <Button type="button" variant="ghost" onClick={clearFormatting} tooltip="Clear formatting">
          <TrashIcon className="tiptap-button-icon" />
        </Button>
        <Button type="button" variant="ghost" onClick={onToggleFullscreen} tooltip="Toggle fullscreen">
          {isFullscreen ? (
            <CollapseIcon className="tiptap-button-icon" />
          ) : (
            <ExpandIcon className="tiptap-button-icon" />
          )}
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <ImageResizeControls editor={editor} />

      <Spacer />

      {isMobile && <ToolbarSeparator />}
    </>
  );
};

const MobileToolbarContent = ({ type, onBack }: { type: 'highlighter' | 'link'; onBack: () => void }) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
  </>
);

export function SimpleEditor({
  placeholder = 'Start writing...',
  value,
  onChange,
  disabled = false,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>('main');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder,
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      FontSize,
      Color,
      ResizableImage,
      Typography,
      Superscript,
      Subscript,
      Selection,
      NodeBackground,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => {
          console.error('Upload failed:', error);
          message.error(error.message || 'Image upload failed');
        },
      }),
    ],
    content: value ?? '<p></p>',
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor || value === undefined) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      window.addEventListener('keydown', onKeyDown);
    }

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (!editor) return;

    let activeImageEl: HTMLImageElement | null = null;
    let startX = 0;
    let startWidth = 0;

    const getEditableRoot = () => editor.view.dom as HTMLElement;
    const getContainerWidth = (img: HTMLImageElement) => {
      const container = img.closest('.simple-editor-content') as HTMLElement | null;
      return container?.clientWidth || getEditableRoot().clientWidth || 1;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!activeImageEl) return;
      const deltaX = event.clientX - startX;
      const containerWidth = getContainerWidth(activeImageEl);
      const nextWidthPx = Math.max(80, Math.min(containerWidth, startWidth + deltaX));
      activeImageEl.style.width = `${nextWidthPx}px`;
      activeImageEl.style.height = 'auto';
      getEditableRoot().classList.add('resize-cursor');
    };

    const onMouseUp = () => {
      if (!activeImageEl) return;

      const containerWidth = getContainerWidth(activeImageEl);
      const finalWidthPx = activeImageEl.getBoundingClientRect().width;
      const finalWidthPercent = Math.max(5, Math.min(100, (finalWidthPx / containerWidth) * 100));
      const finalWidth = `${Math.round(finalWidthPercent)}%`;

      // Persist width on selected image node.
      editor.chain().focus().updateAttributes('image', { width: finalWidth }).run();

      activeImageEl = null;
      getEditableRoot().classList.remove('resize-cursor');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.tagName !== 'IMG') return;
      const img = target as HTMLImageElement;

      const rect = img.getBoundingClientRect();
      const nearRightEdge = rect.right - event.clientX <= 10;
      if (!nearRightEdge) return;

      event.preventDefault();
      activeImageEl = img;
      startX = event.clientX;
      startWidth = rect.width;

      // Ensure this image node is selected before updating attributes.
      const pos = editor.view.posAtDOM(img, 0);
      editor.chain().focus().setNodeSelection(pos).run();

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const onHoverMove = (event: MouseEvent) => {
      if (activeImageEl) return;
      const target = event.target as HTMLElement | null;
      if (!target || target.tagName !== 'IMG') {
        getEditableRoot().classList.remove('resize-cursor');
        return;
      }

      const rect = (target as HTMLImageElement).getBoundingClientRect();
      const nearRightEdge = rect.right - event.clientX <= 10;
      getEditableRoot().classList.toggle('resize-cursor', nearRightEdge);
    };

    const root = getEditableRoot();
    root.addEventListener('mousedown', onMouseDown);
    root.addEventListener('mousemove', onHoverMove);

    return () => {
      root.removeEventListener('mousedown', onMouseDown);
      root.removeEventListener('mousemove', onHoverMove);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      root.classList.remove('resize-cursor');
    };
  }, [editor]);

  return (
    <div className={`simple-editor-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile && !isFullscreen
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              editor={editor}
              // onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              isMobile={isMobile}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
      </EditorContext.Provider>
    </div>
  );
}
