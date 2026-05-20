import useValue from '@base/antd/hooks/useValue';
import { AutoComplete, AutoCompleteProps } from 'antd';
import React, { useCallback } from 'react';
import FloatLabel from './FloatLabel';

export interface IProps extends AutoCompleteProps {
  required?: boolean;
}

const FloatAutoComplete: React.FC<IProps> = ({
  required,
  placeholder,
  defaultValue,
  value,
  onFocus,
  onBlur,
  onChange,
  style,
  className,
  ...rest
}) => {
  const {
    hasValue,
    handleChangeFn,
    handleBlurFn,
    handleFocusFn,
    handleMouseEnterFn,
    handleMouseLeaveFn,
    isFocus,
    isHover,
  } = useValue({
    id: rest.id,
    defaultValue,
    value,
    onFocus,
    onBlur,
  });

  const changeHandlerFn = useCallback<Exclude<AutoCompleteProps['onChange'], undefined>>(
    (value, option) => {
      handleChangeFn(value);
      if (onChange) {
        onChange(value, option);
      }
    },
    [onChange, handleChangeFn],
  );

  return (
    <FloatLabel
      label={placeholder}
      required={required}
      focused={isFocus}
      hovered={isHover}
      hasValue={hasValue}
      width={style?.width}
      height={style?.height}
      status={rest.status || (rest['aria-invalid'] ? 'error' : undefined)}
    >
      <AutoComplete
        {...rest}
        className={className}
        style={style}
        onFocus={handleFocusFn}
        onBlur={handleBlurFn}
        onMouseEnter={handleMouseEnterFn}
        onMouseLeave={handleMouseLeaveFn}
        value={value}
        defaultValue={defaultValue}
        onChange={changeHandlerFn}
      />
    </FloatLabel>
  );
};

export default FloatAutoComplete;
