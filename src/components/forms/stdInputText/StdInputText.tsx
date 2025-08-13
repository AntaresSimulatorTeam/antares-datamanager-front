import { useStdId } from '@/hooks/useStdId';
import { StdChangeHandler } from '@/shared/types/StdBase.type';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdButton from '@common/base/stdButton/StdButton';
import { useRef } from 'react';
import StdRequiredIndicator from '../stdRequiredIndicator/StdRequiredIndicator';
import { textClassBuilder } from './textClassBuilder';

export type TextVariant = 'outlined' | 'text';

export type StdInputTextBaseProps = {
  label?: string;
  onChange?: StdChangeHandler<string>;
  onBlur?: (e: React.FocusEvent<{ value: string }>) => void;
  id?: string;
  name?: string;
  placeHolder?: string;
  disabled?: boolean;
  variant?: TextVariant;
  helperText?: string;
  error?: boolean;
  maxLength?: number;
  password?: boolean;
  required?: boolean;
  autoFocus?: boolean;
};

export type StdInputTextControlledProps = {
  value: string;
  defaultValue?: never;
};

export type StdInputTextUncontrolledProps = {
  value?: never;
  defaultValue?: string;
};

export type StdInputTextProps = StdInputTextBaseProps & (StdInputTextControlledProps | StdInputTextUncontrolledProps);

const StdInputText = ({
  label = '',
  onChange,
  onBlur,
  value: valueFromProps,
  defaultValue,
  id: propsId,
  name,
  variant = 'text',
  disabled = false,
  error = false,
  password = false,
  required = false,
  placeHolder,
  helperText,
  maxLength,
  autoFocus = false,
}: StdInputTextProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useStdId('input', propsId);

  const isControlled = valueFromProps !== undefined;
  const value = isControlled ? valueFromProps : inputRef.current?.value;

  const { wrapperInputClasses, labelClasses, inputClasses, helperClasses, buttonClasses } = textClassBuilder(
    variant,
    disabled,
    error,
    !value || disabled,
  );

  const clearValue = () => {
    if (!isControlled) {
      inputRef.current!.value = '';
    }
    void onChange?.('');
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void onChange?.(e.target.value);
  };

  return (
    <div className="inline-flex w-full flex-col items-start justify-start">
      {label && (
        <div className={labelClasses}>
          <label htmlFor={id}>
            {label}
            {required && <StdRequiredIndicator />}
          </label>
          {maxLength && <span>{`${value?.length ?? 0}/${maxLength}`}</span>}
        </div>
      )}
      <div className={wrapperInputClasses}>
        <input
          ref={inputRef}
          className={inputClasses}
          defaultValue={defaultValue}
          value={valueFromProps}
          aria-label={label}
          placeholder={placeHolder}
          type={password ? 'password' : 'text'}
          name={name}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          id={id}
          required={required}
          autoFocus={autoFocus}
        />
        <div className={buttonClasses}>
          <StdButton icon={StdIconId.Close} variant="text" color="secondary" size="extraSmall" onClick={clearValue} />
        </div>
      </div>
      <span className={helperClasses}>{helperText}</span>
    </div>
  );
};

export default StdInputText;
