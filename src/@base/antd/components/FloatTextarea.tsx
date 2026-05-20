import useValue from '@base/antd/hooks/useValue';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/es/input';
import { useCallback } from 'react';
import FloatLabel from './FloatLabel';

export interface IProps extends TextAreaProps {
  required?: boolean;
}

const FloatTextarea: React.FC<IProps> = ({
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
    id: rest.id,
    defaultValue,
    value,
    onFocus,
    onBlur,
  });

  const changeHandlerFn = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (e) => {
      handleChangeFn(e.target.value);
      if (onChange) onChange(e);
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
      <Input.TextArea
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
        size={size}
      />
    </FloatLabel>
  );
};

export default FloatTextarea;
