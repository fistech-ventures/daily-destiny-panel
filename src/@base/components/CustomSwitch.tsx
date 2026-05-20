import { cn } from '@lib/utils';
import { Switch, SwitchProps, Tag } from 'antd';
import React from 'react';

interface IProps extends SwitchProps {
  checked: boolean;
}

const CustomSwitch: React.FC<IProps> = ({ checked, ...rest }) => {
  return (
    <div className="inline-flex items-center gap-1 p-1 border border-gray-300 rounded-md">
      <Tag
        className={cn('!text-white', {
          '!bg-green-700': checked,
          '!bg-yellow-500': !checked,
        })}
      >
        {checked ? 'YES' : 'NO'}
      </Tag>
      <Switch {...rest} checked={checked} size="small" className="bg-gray-300" />
    </div>
  );
};

export default CustomSwitch;
