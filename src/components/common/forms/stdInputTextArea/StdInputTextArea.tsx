import { useStdId } from '@/hooks/useStdId';
import { type StdChangeHandler } from '@/shared/types/StdBase.type';
import { type ChangeEvent } from 'react';
import StdRequiredIndicator from '../stdRequiredIndicator/StdRequiredIndicator';
import { inputTextAreaClassBuilder } from './inputTextAreaClassBuilder';

export interface StdInputTextAreaProps {
  label: string;
  name?: string;
  value: string;
  onChange?: StdChangeHandler<string>;
  onBlur?: (value: React.FocusEvent<{ value: string }>) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  maxLength?: number;
  maxHeight?: number;
  required?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
}

const StdInputTextArea = ({
  label,
  value,
  name,
  onChange,
  onBlur,
  id: propsId,
  disabled = false,
  error = false,
  required = false,
  placeholder,
  helperText,
  maxLength,
  maxHeight,
  readOnly,
  autoFocus = false,
}: StdInputTextAreaProps) => {
  const id = useStdId('area', propsId);
  const { wrapperClasses, labelClasses, inputClasses, helperClasses } = inputTextAreaClassBuilder(
    disabled,
    error,
    maxHeight,
  );

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    void onChange?.(event.target.value);
  };

  return (
    <div className={wrapperClasses}>
      <div className={labelClasses}>
        <label htmlFor={id}>
          {label}
          {required && <StdRequiredIndicator />}
        </label>
        {maxLength && <span>{`${value?.length ?? 0}/${maxLength}`}</span>}
      </div>
      <div className="relative w-full">
        <textarea
          name={name}
          rows={3}
          className={inputClasses}
          value={value}
          aria-label={label}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          id={id}
          required={required}
          readOnly={readOnly}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
        />
      </div>
      <span className={helperClasses}>{helperText}</span>
    </div>
  );
};

export default StdInputTextArea;
