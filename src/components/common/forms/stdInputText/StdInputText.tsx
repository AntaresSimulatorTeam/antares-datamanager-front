/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { StdChangeHandler } from '@/shared/types/StdBase.type';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

import StdButton from '@common/base/stdButton/StdButton';
import { useRef } from 'react';
import StdRequiredIndicator from '../stdRequiredIndicator/StdRequiredIndicator';

import { textClassBuilder } from './textClassBuilder';

export type TextVariant = 'outlined' | 'text';

export interface StdInputTextProps {
  value: string;
  label?: string;
  onChange?: StdChangeHandler<string>;
  onBlur?: (e: React.FocusEvent<{ value: string }>) => void;
  id?: string;
  placeHolder?: string;
  disabled?: boolean;
  variant?: TextVariant;
  helperText?: string;
  error?: boolean;
  maxLength?: number;
  password?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

const StdInputText = ({
  label = '',
  onChange,
  onBlur,
  value,
  id: propsId,
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
  const { wrapperInputClasses, labelClasses, inputClasses, helperClasses, buttonClasses } = textClassBuilder(
    variant,
    disabled,
    error,
    !value || disabled,
  );

  const clearValue = () => {
    if (!onChange) {
      return;
    }
    void onChange('');
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) {
      return;
    }
    void onChange(e.target.value);
  };

  return (
    <div className="inline-flex w-full flex-col items-start justify-start">
      <div className={labelClasses}>
        <label htmlFor={id}>
          {label}
          {required && <StdRequiredIndicator />}
        </label>
        {maxLength && <span>{`${value?.length ?? 0}/${maxLength}`}</span>}
      </div>
      <div className={wrapperInputClasses}>
        <input
          ref={inputRef}
          className={inputClasses}
          value={value}
          aria-label={label}
          placeholder={placeHolder}
          type={password ? 'password' : 'text'}
          name={value}
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
