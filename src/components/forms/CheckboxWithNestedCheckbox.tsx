import { useStdId } from '@/hooks/common/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ChangeEvent, useRef, useState } from 'react';
import { checkboxClassBuilder } from '@common/forms/stdCheckbox/checkboxClassBuilder.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import StdRequiredIndicator from '@common/forms/stdRequiredIndicator/StdRequiredIndicator.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';

type CheckboxWithNestedCheckboxProps = {
  label?: string;
  checkboxControl?: boolean;
  value?: Exclude<string, 'checkbox_control'>;
  name: string;
  id?: string;
  disabled?: boolean;
  isReadOnly?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string, checked: boolean, isDefault: boolean) => void;
  onBlur?: (e: React.FocusEvent<{ checked: boolean }>) => void;
  required?: boolean;
  error?: boolean;
  options: string[];
  checkedValues?: { name: string; subOptions: string[] | null }[];
  onHandleSelection: (value: string, checked: boolean, isDefault: boolean, parentValue?: string) => void;
};

export const CheckboxWithNestedCheckbox = ({
  name,
  value,
  label,
  disabled = false,
  isReadOnly = false,
  checkboxControl,
  onHandleSelection,
  id: propsId,
  error = false,
  required = false,
  options,
  checkedValues,
}: CheckboxWithNestedCheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const id = useStdId('nested-cbox', propsId);
  const { containerClasses, inputClasses, labelClasses } = checkboxClassBuilder(disabled, error);

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
              checked={checkedValues?.some((checkedValue) => checkedValue.name === value)}
              onMouseDown={(e) => e.preventDefault()}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onHandleSelection?.(event.target.value, event.target.checked, disabled)
              }
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
          <button onClick={() => !disabled && setIsOpen((prev) => !prev)}>
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
            onChange={(valueChecked: string, isChecked?: boolean) =>
              onHandleSelection?.(valueChecked, isChecked ?? false, disabled, value)
            }
            disabled={isReadOnly}
            checkedValues={checkedValues?.find((checkedValue) => checkedValue.name === value)?.subOptions ?? []}
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
