/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useRef } from 'react';
import StdButton from '../../base/stdButton/StdButton';
import { clearClassBuilder, searchClassBuilder } from './SearchInputClassBuilder';
import { useStdId } from '@/hooks/common/useStdId';
import { useInputFormState } from '@/hooks/common/useInputFormState';
import useDebounce from '@/hooks/common/useDebounce';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

export type SearchVariant = 'outlined' | 'filled';
export type SearchInputSize = 'small' | 'medium';

export interface StdSearchInputProps {
  onSearch: (input: string | undefined) => void;
  placeHolder?: string;
  label?: string;
  value?: string;
  onChange?: (input: string | undefined) => void;
  id?: string;
  defaultValue?: string;
  disabled?: boolean;
  variant?: SearchVariant;
  name?: string;
  size?: SearchInputSize;
}

const ENTER_KEY_CODE = 'Enter';

const StdSearchInput = ({
  onSearch,
  defaultValue,
  disabled = false,
  id: propsId,
  label,
  placeHolder = '',
  variant = 'filled',
  name,
  size = 'medium',
  value: propsValue = '',
  onChange,
}: StdSearchInputProps) => {
  const { inputWrapperClass, inputClasses, labelClass } = searchClassBuilder(variant, disabled, size);
  const id = useStdId('search', propsId);
  const inputRef = useRef<HTMLInputElement>(null);
  const { value: stateValue, setValue } = useInputFormState(propsValue, defaultValue, (value) => {
    if (inputRef.current && value) {
      inputRef.current.value = value;
    }
  });

  useDebounce(() => onChange?.(stateValue), stateValue);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code == ENTER_KEY_CODE) {
      onSearch(stateValue);
    }
  };

  const clearValue = () => {
    setValue('');
    inputRef?.current?.focus();
  };

  return (
    <div className="flex h-auto w-full flex-col justify-center" onClick={() => inputRef.current?.focus()} role="search">
      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      <div className={inputWrapperClass}>
        <input
          type="search"
          name={name}
          id={id}
          className={inputClasses}
          placeholder={placeHolder}
          disabled={disabled}
          value={stateValue}
          onChange={handleChange}
          onKeyUp={handleEnter}
          ref={inputRef}
          role="searchbox"
        />
        <span className={clearClassBuilder(!stateValue || disabled)}>
          <StdButton icon={StdIconId.Close} size="extraSmall" variant="text" onClick={clearValue} color="secondary" />
        </span>
        <StdButton
          icon={StdIconId.Search}
          size="extraSmall"
          variant="text"
          onClick={() => onSearch(stateValue)}
          color="secondary"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default StdSearchInput;
