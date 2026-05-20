import { TreeSelect, TreeSelectProps } from 'antd';
import { useCallback } from 'react';
import useValue from '../hooks/useValue';
import FloatLabel from './FloatLabel';

export interface IProps extends TreeSelectProps {
  required?: boolean;
}

const FloatTreeSelect: React.FC<IProps> = ({
  placeholder,
  defaultValue,
  value,
  onFocus,
  onBlur,
  onChange,
  required,
  size,
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
    id: rest.id?.toString(),
    defaultValue,
    value,
    onFocus,
    onBlur,
  });

  const changeHandlerFn = useCallback(
    (value: any, labelList: React.ReactNode[], extra: any) => {
      handleChangeFn(value);
      if (onChange) onChange(value, labelList, extra);
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
      <TreeSelect
        {...rest}
        className={className}
        style={style}
        onFocus={handleFocusFn}
        onBlur={handleBlurFn}
        onMouseEnter={handleMouseEnterFn}
        onMouseLeave={handleMouseLeaveFn}
        value={value}
        defaultValue={defaultValue}
        size={size}
        onChange={changeHandlerFn}
      />
    </FloatLabel>
  );
};

export default FloatTreeSelect;
