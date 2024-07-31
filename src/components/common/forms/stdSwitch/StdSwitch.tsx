/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useInputFormState } from '@/hooks/common/useInputFormState';
import { useStdId } from '@/hooks/common/useStdId';
import { StdChangeHandler } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { ChangeEvent, useRef } from 'react';
import { switchClassBuilder } from './SwitchClassBuilder';

export type SwitchSize = 'small' | 'medium';

export interface StdSwitchProps {
  name: string;
  value: string;
  label: string;
  id?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: StdChangeHandler<boolean | undefined>;
  size?: SwitchSize;
  disabled?: boolean;
}

const StdSwitch = (props: StdSwitchProps) => {
  const { id: propsId, name, value, label, defaultChecked, checked, onChange, disabled, size = 'medium' } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const { setValue: setStateValue } = useInputFormState(checked, defaultChecked, onChange, (checkedStatus) => {
    if (inputRef.current) {
      inputRef.current.checked = !!checkedStatus;
    }
  });
  const { labelClasses, inputClasses, backgroundClasses, slideClasses, iconContainerClasses, iconSize } =
    switchClassBuilder(size, disabled);
  const id = useStdId('switch', propsId);

  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      setStateValue(event.target.checked);
    }
  };

  return (
    <label className={labelClasses}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        name={name}
        value={value}
        className={inputClasses}
        onChange={updateValue}
        defaultChecked={checked}
        disabled={disabled}
      />
      <span className="sr-only">{label}</span>
      <div className={backgroundClasses} />
      <div className={slideClasses}>
        <div className={iconContainerClasses}>
          <StdIcon name={StdIconId.Done} width={iconSize} height={iconSize} />
        </div>
      </div>
    </label>
  );
};

export default StdSwitch;
