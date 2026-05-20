import FloatSelect from '@base/antd/components/FloatSelect';
import { countryCurrencies } from '@lib/data/countryCurrencies';
import { Toolbox } from '@lib/utils';
import { Select, type SelectProps } from 'antd';
import React from 'react';

interface IProps extends SelectProps {
  required?: boolean;
  isFloat?: boolean;
  currency: string;
  onSelectCurrency: (currency: string) => void;
}

const CountryCurrencySelect: React.FC<IProps> = ({
  required = false,
  isFloat = false,
  placeholder,
  currency,
  onSelectCurrency,
  ...rest
}) => {
  if (isFloat) {
    return (
      <FloatSelect
        required={required}
        virtual={false}
        placeholder={placeholder || 'Currency'}
        options={countryCurrencies.map((countryCurrency) => ({
          key: countryCurrency.identifier,
          label: `${countryCurrency.currency} ${countryCurrency.symbol}`,
          value: `${countryCurrency.currency}_${countryCurrency.symbol}`,
        }))}
        filterOption={(input, option: any) => Toolbox.toLowerText(option?.label)?.includes(Toolbox.toLowerText(input))}
        onChange={(value) => onSelectCurrency(value)}
        value={currency}
        {...rest}
      />
    );
  }

  return (
    <Select
      virtual={false}
      placeholder={placeholder || 'Currency'}
      options={countryCurrencies.map((countryCurrency) => ({
        key: countryCurrency.identifier,
        label: `${countryCurrency.identifier} ${countryCurrency.symbol}`,
        value: `${countryCurrency.identifier}_${countryCurrency.symbol}`,
      }))}
      filterOption={(input, option: any) => Toolbox.toLowerText(option?.label)?.includes(Toolbox.toLowerText(input))}
      onChange={(value) => onSelectCurrency(value)}
      value={currency}
      {...rest}
    />
  );
};

export default CountryCurrencySelect;
