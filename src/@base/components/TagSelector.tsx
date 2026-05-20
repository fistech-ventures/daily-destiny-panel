import { ITag } from '@modules/tags/lib/interfaces';
import { TagsHooks } from '@modules/tags/lib/hooks';
import { Button, message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineTag, HiX, HiCheck } from 'react-icons/hi';

interface IProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

const TagSelector: React.FC<IProps> = ({
  value = [],
  onChange,
  placeholder = "Select or create tags...",
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tagsQuery = TagsHooks.useFind({
    options: {
      limit: 20,
      searchTerm: searchTerm,
      isActive: 'true',
    },
    config: {
      queryKey: [],
      enabled: true, // Always enabled to show tags on focus
    },
  });

  const createMutation = TagsHooks.useCreate({
    config: {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const newTag = data.data;
          const currentTags = value || [];
          onChange?.([...currentTags, newTag.title]);
          setInputValue('');
          setSearchTerm('');
          setIsOpen(false);
          message.success('Tag created successfully!');
        }
      },
      onError: (error) => {
        message.error('Failed to create tag');
        console.error('Tag creation error:', error);
      },
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSearchTerm(val);
    setIsOpen(true);
  };

  const handleTagSelect = (tag: ITag) => {
    const currentTags = value || [];
    if (!currentTags.includes(tag.title)) {
      onChange?.([...currentTags, tag.title]);
    }
    setInputValue('');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleCreateTag = () => {
    if (!inputValue.trim()) return;

    const tagTitle = inputValue.trim();

    createMutation.mutate({
      title: tagTitle,
      isActive: true,
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = value || [];
    onChange?.(currentTags.filter(tag => tag !== tagToRemove));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const existingTag = tagsQuery.data?.data?.find(tag => 
        tag.title.toLowerCase() === inputValue.trim().toLowerCase()
      );

      if (existingTag) {
        handleTagSelect(existingTag);
      } else if (inputValue.trim()) {
        handleCreateTag();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
      setSearchTerm('');
    } else if (e.key === 'Backspace' && !inputValue && value && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const newTags = [...value];
      newTags.pop();
      onChange?.(newTags);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if clicking on create button or dropdown
    if (!e.relatedTarget || !containerRef.current?.contains(e.relatedTarget as Node)) {
      setTimeout(() => setIsOpen(false), 200);
    }
  };

  const filteredTags = tagsQuery.data?.data?.filter(tag => 
    !value?.includes(tag.title)
  ) || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canCreateTag = inputValue.trim() && 
    !filteredTags.some(tag => tag.title.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !value?.includes(inputValue.trim());

  const isSelected = (tagTitle: string) => {
    return value?.includes(tagTitle) || false;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Single Container for Input and Selected Tags */}
      <div className={`border border-gray-300 rounded-md p-2 transition-all duration-200 ${
        isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
      }`}>
        {/* Selected Tags and Text Input in Same Line */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selected Tags (Chips) */}
          {value && value.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-600 hover:text-red-500 transition-colors"
                title="Remove tag"
              >
                <HiX className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={value && value.length > 0 ? "" : placeholder}
            className="flex-1 outline-none bg-transparent text-sm min-w-[100px]"
          />

          {/* Optional Search Icon */}
          {!inputValue && !tagsQuery.isLoading && !canCreateTag && (
            <HiOutlineTag className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Loading Indicator */}
        {tagsQuery.isLoading && (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && (filteredTags.length > 0 || canCreateTag) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {tagsQuery.isLoading && (
            <div className="p-3 text-center text-gray-500">
              Loading tags...
            </div>
          )}
          
          {/* Create Option - Moved to Top */}
          {inputValue.trim() && !filteredTags.some(tag => 
            tag.title.toLowerCase() === inputValue.trim().toLowerCase()
          ) && (
            <div className="px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition-colors">
              <span className="text-blue-600">{inputValue.trim()}</span>
              <Button
                type="primary"
                size="small"
                onClick={handleCreateTag}
                loading={createMutation.isPending}
                className="ml-2"
              >
                Create
              </Button>
            </div>
          )}
          
          {filteredTags.length > 0 && (
            <div>
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  onClick={() => handleTagSelect(tag)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span>{tag.title}</span>
                  {isSelected(tag.title) && (
                    <HiCheck className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!tagsQuery.isLoading && filteredTags.length === 0 && searchTerm && (
            <div className="p-3 text-center text-gray-500">
              No tags found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
