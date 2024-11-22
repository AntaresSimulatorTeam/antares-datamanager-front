/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useInputFormState } from '@/hooks/useInputFormState';
import { useStdId } from '@/hooks/useStdId';
import { StdChangeHandler } from '@/shared/types/common/StdBase.type';

import { ChangeEvent, useRef } from 'react';
import radioButtonClassBuilder from './radioButtonClassBuilder';

export interface StdRadioButtonProps {
  value: string;
  label: string;
  name?: string;
  id?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onChange?: StdChangeHandler<boolean | undefined>;
}

const StdRadioButton = ({
  name,
  value,
  id: propsId,
  label,
  defaultChecked,
  checked,
  disabled,
  onChange,
}: StdRadioButtonProps) => {
  const { labelContainerClasses, containerClasses, radioCircleClasses, textClasses } =
    radioButtonClassBuilder(disabled);
  const id = useStdId('rbn', propsId);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setValue: setStateValue } = useInputFormState(checked, defaultChecked, onChange, (checkedStatus) => {
    if (inputRef.current) {
      inputRef.current.checked = !!checkedStatus;
    }
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStateValue(event.target.checked);
  };

  return (
    <label className={labelContainerClasses}>
      <input
        ref={inputRef}
        type="radio"
        name={name}
        id={id}
        className="peer sr-only"
        onChange={handleChange}
        value={value}
        defaultChecked={defaultChecked}
        disabled={disabled}
      />
      <div className={containerClasses}>
        <div className="rounded-full p-0.25">
          <div className={radioCircleClasses} />
        </div>
      </div>
      <span className={textClasses}>{label}</span>
    </label>
  );
};

export default StdRadioButton;
