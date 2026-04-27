import { useStdId } from '@/hooks/common/useStdId';
import { StdChangeHandler } from '@/shared/types/StdBase.type';
import { useEffect, useRef } from 'react';
import StdRequiredIndicator from '../stdRequiredIndicator/StdRequiredIndicator';
import { checkboxClassBuilder } from './checkboxClassBuilder';
import { Icon } from '@design-system-rte/react';

export type StdCheckboxProps = {
  defaultChecked?: boolean;
  label?: string;
  checkboxControl?: boolean;
  value?: Exclude<string, 'checkbox_control'>;
  name?: string;
  id?: string;
  disabled?: boolean;
  onChange?: StdChangeHandler<boolean | undefined>;
  onBlur?: (e: React.FocusEvent<{ checked: boolean }>) => void;
  required?: boolean;
  error?: boolean;
  delayDebounce?: number;
  indeterminate?: boolean;
  checked?: boolean;
};

const StdCheckbox = ({
  name,
  value,
  label,
  disabled = false,
  checkboxControl,
  onChange,
  onBlur,
  id: propsId,
  error = false,
  required = false,
  indeterminate,
  checked = false,
}: StdCheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const { containerClasses, inputClasses, labelClasses } = checkboxClassBuilder(disabled, error);

  const id = useStdId('cbox', propsId);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void onChange?.(event.target.checked);
  };

  return (
    <label className={containerClasses} aria-label={label}>
      <input
        id={id}
        ref={inputRef}
        className="peer sr-only"
        type="checkbox"
        name={name}
        disabled={disabled}
        checked={checked}
        onChange={handleOnChange}
        onMouseDown={(e) => e.preventDefault()}
        onBlur={onBlur}
        value={checkboxControl ? 'checkbox_control' : value}
      />
      <div className={inputClasses}>
        <div className="done-icon hidden">
          <Icon name="check" color="#fff" size={14} />
        </div>
        <div className="indeterminate-icon hidden">
          <Icon name="check-indeterminate" color="#fff" size={14} />
        </div>
      </div>
      <span className={labelClasses}>
        {label} {required && <StdRequiredIndicator />}
      </span>
    </label>
  );
};

export default StdCheckbox;
