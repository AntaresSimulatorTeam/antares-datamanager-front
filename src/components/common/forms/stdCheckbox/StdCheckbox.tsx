/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/useStdId';
import { StdChangeHandler } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

import { useEffect, useRef } from 'react';
import StdIcon from '../../base/stdIcon/StdIcon';
import StdRequiredIndicator from '../stdRequiredIndicator/StdRequiredIndicator';
import { checkboxClassBuilder } from './checkboxClassBuilder';

export type StdCheckboxProps = {
  label?: string;
  checkboxControl?: boolean;
  value?: Exclude<string, 'checkbox_control'>;
  name?: string;
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
};

const StdCheckbox = ({
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
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={handleOnChange}
        onMouseDown={(e) => e.preventDefault()}
        onBlur={onBlur}
        value={checkboxControl ? 'checkbox_control' : value}
      />
      <div className={inputClasses}>
        <div className="done-icon hidden">
          <StdIcon name={StdIconId.Done} color="gray-w" width={14} height={14} />
        </div>
        <div className="indeterminate-icon hidden">
          <StdIcon name={StdIconId.HorizontalRule} color="gray-w" width={14} height={14} />
        </div>
      </div>
      <span className={labelClasses}>
        {label} {required && <StdRequiredIndicator />}
      </span>
    </label>
  );
};

export default StdCheckbox;
