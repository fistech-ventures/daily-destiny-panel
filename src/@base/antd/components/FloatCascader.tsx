import useValue from '@base/antd/hooks/useValue';
import { Cascader, CascaderProps } from 'antd';
import React, { useCallback } from 'react';
import FloatLabel from './FloatLabel';

export interface IProps extends CascaderProps {
  required?: boolean;
  defaultValue?: any;
  value?: any;
  multiple?: boolean;
}

const FloatCascader: React.FC<IProps> = ({
  required,
  placeholder,
  defaultValue,
  value,
  onFocus,
  onBlur,
  onChange,
  multiple = true,
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

  const changeHandlerFn = useCallback(
    (value: any, selectedOptions: any) => {
      handleChangeFn(value);
      if (onChange) onChange(value, selectedOptions);
    },
    [onChange, handleChangeFn],
  );

  return (
    <FloatLabel
      label={placeholder}
      focused={isFocus}
      hovered={isHover}
      hasValue={hasValue}
      width={style?.width}
      height={style?.height}
      required={required}
      status={rest.status || (rest['aria-invalid'] ? 'error' : undefined)}
    >
      <Cascader
        {...rest}
        className={className}
        style={style}
        multiple={multiple}
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

export default FloatCascader;
