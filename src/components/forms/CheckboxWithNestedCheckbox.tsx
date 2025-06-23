import { useStdId } from '@/hooks/common/useStdId';
import { StdChangeHandler } from '@/shared/types/StdBase.type';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { useEffect, useRef, useState } from 'react';
import { checkboxClassBuilder } from '@common/forms/stdCheckbox/checkboxClassBuilder.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import StdRequiredIndicator from '@common/forms/stdRequiredIndicator/StdRequiredIndicator.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';

export type CheckboxWithNestedCheckboxProps = {
  label?: string;
  checkboxControl?: boolean;
  value?: Exclude<string, 'checkbox_control'>;
  name: string;
  id?: string;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: StdChangeHandler<boolean | undefined>;
  onBlur?: (e: React.FocusEvent<{ checked: boolean }>) => void;
  required?: boolean;
  error?: boolean;
  delayDebounce?: number;
  indeterminate?: boolean;
  options: string[];
  handleSelection: (value: string) => void;
};

const CheckboxWithNestedCheckbox = ({
  name,
  value,
  label,
  disabled = false,
  defaultChecked,
  checkboxControl,
  checked,
  onChange,
  onBlur,
  id: propsId,
  error = false,
  required = false,
  indeterminate,
  options,
  handleSelection,
}: CheckboxWithNestedCheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [checkedValues, setCheckedValues] = useState<string[]>(disabled ? options : []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const { containerClasses, inputClasses, labelClasses } = checkboxClassBuilder(disabled, error);

  const id = useStdId('nested-cbox', propsId);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void onChange?.(event.target.checked);
  };

  const onHandleSelection = (valueChecked: string) => {
    setCheckedValues((prev) => {
      if (prev.includes(valueChecked)) {
        return [...prev.filter((checkedValue) => checkedValue !== valueChecked)];
      } else {
        return [...prev, valueChecked];
      }
    });
    void handleSelection?.(valueChecked);
  };

  return (
    <div className="flex flex-col justify-center">
      <label className={containerClasses} aria-label={label}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              id={id}
              ref={inputRef}
              className="peer sr-only"
              type="checkbox"
              name={name}
              disabled={disabled}
              defaultChecked={defaultChecked}
              checked={checked}
              onChange={handleOnChange}
              onMouseDown={(e) => e.preventDefault()}
              onBlur={onBlur}
              value={checkboxControl ? 'checkbox_control' : value}
            />
            <div className={inputClasses}>
              <div className="done-icon hidden">
                <StdIcon name={StdIconId.Done} color="text-gray-w" width={14} height={14} />
              </div>
              <div className="indeterminate-icon hidden">
                <StdIcon name={StdIconId.HorizontalRule} color="text-gray-w" width={14} height={14} />
              </div>
            </div>
            <span className={labelClasses}>
              {label} {required && <StdRequiredIndicator />}
            </span>
          </div>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            <StdIcon
              name={isOpen ? StdIconId.KeyboardArrowDown : StdIconId.KeyboardArrowRight}
              color="text-gray-800"
              width={14}
              height={14}
            />
          </button>
        </div>
      </label>
      {isOpen && (
        <div className="ml-2 transition-[height] delay-150 ease-in-out">
          <StdCheckboxGroupWrapper
            label={''}
            name={''}
            onChange={(checkedValue: string) => handleSelection(checkedValue)}
            checkedValues={checkedValues}
            possibleValues={options}
          >
            {options?.map((option, index) => (
              <div key={`${index}-${option}`} className="my-1">
                <StdCheckbox key={`nested-${option}`} label={option} value={option} name={''} />
              </div>
            ))}
          </StdCheckboxGroupWrapper>
        </div>
      )}
    </div>
  );
};

export default CheckboxWithNestedCheckbox;
