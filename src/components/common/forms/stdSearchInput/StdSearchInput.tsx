/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useRef, useState } from 'react';
import StdButton from '../../base/stdButton/StdButton';
import { clearClassBuilder, searchClassBuilder } from './SearchInputClassBuilder';

export type SearchVariant = 'outlined' | 'filled';
export type SearchInputSize = 'small' | 'medium';

export type StdSearchInputProps = {
  onSearch: (input: string | undefined) => void;
  placeHolder?: string;
  label?: string;
  onChange?: (input: string | undefined) => void;
  id?: string;
  disabled?: boolean;
  variant?: SearchVariant;
  name?: string;
  size?: SearchInputSize;
  defaultValue?: string;
};

const ENTER_KEY_CODE = 'Enter';

const StdSearchInput = ({
  onSearch,
  disabled = false,
  id: propsId,
  label,
  placeHolder = '',
  variant = 'filled',
  name,
  size = 'medium',
  defaultValue = '',
  onChange,
}: StdSearchInputProps) => {
  const { inputWrapperClass, inputClasses, labelClass } = searchClassBuilder(variant, disabled, size);
  const id = useStdId('search', propsId);
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    void onChange?.(event.target.value);
    setInternalValue(event.target.value);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code == ENTER_KEY_CODE) {
      onSearch(internalValue);
    }
  };

  const clearValue = () => {
    void onChange?.('');
    onSearch('');
    setInternalValue('');
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
          value={internalValue}
          onChange={handleChange}
          onKeyUp={handleEnter}
          ref={inputRef}
          role="searchbox"
        />
        <span className={clearClassBuilder(!internalValue || disabled)}>
          <StdButton icon={StdIconId.Close} size="extraSmall" variant="text" onClick={clearValue} color="secondary" />
        </span>
        <StdButton
          icon={StdIconId.Search}
          size="extraSmall"
          variant="text"
          onClick={() => onSearch(internalValue)}
          color="secondary"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default StdSearchInput;
