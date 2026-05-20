import useValue from '@base/antd/hooks/useValue';
import { Select, SelectProps } from 'antd';
import { useCallback } from 'react';
import FloatLabel from './FloatLabel';

export interface IProps extends SelectProps {
  required?: boolean;
}

const FloatSelect: React.FC<IProps> = ({
  defaultValue,
  value,
  placeholder,
  onFocus,
  onBlur,
  onChange,
  required,
  mode,
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

  const changeHandlerFn = useCallback<Exclude<SelectProps['onChange'], undefined>>(
    (value, option) => {
      handleChangeFn(value);
      if (onChange) onChange(value, option);
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
      <Select
        {...rest}
        className={className}
        style={{ height: 'auto', ...style }}
        onFocus={handleFocusFn}
        onBlur={handleBlurFn}
        onMouseEnter={handleMouseEnterFn}
        onMouseLeave={handleMouseLeaveFn}
        value={value}
        defaultValue={defaultValue}
        size={size}
        onChange={changeHandlerFn}
        mode={mode}
      />
    </FloatLabel>
  );
};

export default FloatSelect;
