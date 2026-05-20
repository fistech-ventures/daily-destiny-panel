import useValue from '@base/antd/hooks/useValue';
import { Input } from 'antd';
import { PasswordProps } from 'antd/es/input';
import { useCallback } from 'react';
import FloatLabel from './FloatLabel';

export interface IProps extends PasswordProps {
  required?: boolean;
}

const FloatInputPassword: React.FC<IProps> = ({
  placeholder,
  defaultValue,
  value,
  onFocus,
  onBlur,
  onChange,
  required,
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

  const changeHandlerFn = useCallback<Exclude<PasswordProps['onChange'], undefined>>(
    (value) => {
      handleChangeFn(value);
      if (onChange) {
        onChange(value);
      }
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
      <Input.Password
        {...rest}
        className={className}
        style={{ position: 'static', ...style }}
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

export default FloatInputPassword;
