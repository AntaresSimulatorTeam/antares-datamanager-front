/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useInputFormState } from '@/hooks/common/useInputFormState';
import { useStdId } from '@/hooks/useStdId';
import { StdChangeHandler } from '@/shared/types/common/StdBase.type';

import StdRadioButton, { StdRadioButtonProps } from '../stdRadioButton/StdRadioButton';
import radioButtonGroupClassBuilder from './radioButtonGroupClassBuilder';

type StdOmittedRadioButtonProps = Omit<StdRadioButtonProps, 'name' | 'onChange' | 'checked' | 'defaultChecked'>;

export interface StdRadioButtonGroupProps {
  label: string;
  name: string;
  children: React.ReactElement<StdOmittedRadioButtonProps>[];
  defaultChecked?: string;
  checked?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onChange?: StdChangeHandler<string | undefined>;
  id?: string;
}

const StdRadioButtonGroup = ({
  label,
  name,
  children,
  defaultChecked,
  checked,
  disabled,
  required,
  error,
  helperText,
  onChange,
  id: propsId,
}: StdRadioButtonGroupProps) => {
  const { fieldsetClasses, helperTextClasses, textClasses } = radioButtonGroupClassBuilder(error, disabled);
  const id = useStdId('rbg', propsId);

  const { setValue: setStateValue, value: checkedValue } = useInputFormState(checked, defaultChecked, onChange);

  const handleChange = (newValue: string) => (selected?: boolean) => {
    if (selected) {
      setStateValue(newValue);
    }
  };

  return (
    <fieldset role="radiogroup" className={fieldsetClasses} disabled={disabled} id={id}>
      <legend className={textClasses}>
        {label} {required && <span className="text-error-600">*</span>}
      </legend>
      {children.map(({ props: { id: radioId, label: labelRadio, value, ...otherProps } }) => (
        <StdRadioButton
          key={labelRadio}
          name={name}
          id={radioId}
          label={labelRadio}
          onChange={handleChange(value)}
          checked={checkedValue === value}
          defaultChecked={defaultChecked === value}
          value={value}
          disabled={disabled}
          {...otherProps}
        />
      ))}
      {helperText && <span className={helperTextClasses}>{helperText}</span>}
    </fieldset>
  );
};

export default StdRadioButtonGroup;
