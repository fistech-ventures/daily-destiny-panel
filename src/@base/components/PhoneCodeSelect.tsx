import FloatSelect from '@base/antd/components/FloatSelect';
import { phoneCodes } from '@lib/data/phoneCodes';
import { Toolbox } from '@lib/utils';
import { Select, type SelectProps } from 'antd';
import React from 'react';

interface IProps extends SelectProps {
  required?: boolean;
  isFloat?: boolean;
  code: string;
  onSelectCode: (code: string) => void;
}

const PhoneCodeSelect: React.FC<IProps> = ({
  required = false,
  isFloat = false,
  placeholder,
  code,
  onSelectCode,
  ...rest
}) => {
  if (isFloat) {
    return (
      <FloatSelect
        required={required}
        virtual={false}
        placeholder={placeholder || 'Code'}
        options={phoneCodes.map((phoneCode) => ({
          key: phoneCode.identifier,
          label: `${phoneCode.identifier} ${phoneCode.code}`,
          value: phoneCode.code,
        }))}
        filterOption={(input, option: any) => Toolbox.toLowerText(option?.label)?.includes(Toolbox.toLowerText(input))}
        onChange={(value) => onSelectCode(value)}
        value={code}
        {...rest}
      />
    );
  }

  return (
    <Select
      virtual={false}
      placeholder={placeholder || 'Code'}
      options={phoneCodes.map((phoneCode) => ({
        key: phoneCode.identifier,
        label: `${phoneCode.identifier} ${phoneCode.code}`,
        value: phoneCode.code,
      }))}
      filterOption={(input, option: any) => Toolbox.toLowerText(option?.label)?.includes(Toolbox.toLowerText(input))}
      onChange={(value) => onSelectCode(value)}
      value={code}
      {...rest}
    />
  );
};

export default PhoneCodeSelect;
