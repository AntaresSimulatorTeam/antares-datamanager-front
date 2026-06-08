import { useStdId } from '@/hooks/useStdId';
import { type ReactNode, useRef } from 'react';
import StdRequiredIndicator from '../stdRequiredIndicator/StdRequiredIndicator';
import { textClassBuilder } from './textClassBuilder';
import { IconButton } from '@design-system-rte/react';

export type TextVariant = 'outlined' | 'text';

export type StdInputTextProps = {
  label?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<{ value: string }>) => void;
  onFocus?: (e: React.FocusEvent<{ value: string }>) => void;
  onKeyUp?: (e: React.KeyboardEvent<{ value: string }>) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: TextVariant;
  helperText?: string;
  error?: boolean;
  maxLength?: number;
  password?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  beforeElement?: ReactNode;
  afterElement?: ReactNode;
  value: string | undefined;
};

const StdInputText = ({
  label = '',
  onChange,
  onBlur,
  onFocus,
  onKeyUp,
  value,
  id: propsId,
  name,
  variant = 'text',
  disabled = false,
  error = false,
  password = false,
  required = false,
  placeholder,
  helperText,
  maxLength,
  autoFocus = false,
  beforeElement,
  afterElement,
}: StdInputTextProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useStdId('input', propsId);

  const { wrapperInputClasses, labelClasses, inputClasses, helperClasses, buttonClasses } = textClassBuilder(
    variant,
    disabled,
    error,
    !value || disabled,
  );

  const clearValue = () => {
    onChange?.('');
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
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
        {beforeElement}
        <input
          ref={inputRef}
          className={inputClasses}
          value={value}
          aria-label={label}
          placeholder={placeholder}
          type={password ? 'password' : 'text'}
          name={name}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          disabled={disabled}
          id={id}
          required={required}
          // oxlint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
        />
        <div className={buttonClasses}>
          <IconButton name="close" variant="text" color="secondary" size="s" onClick={clearValue} />
        </div>
        {afterElement}
      </div>
      {helperText && <span className={helperClasses}>{helperText}</span>}
    </div>
  );
};

export default StdInputText;
