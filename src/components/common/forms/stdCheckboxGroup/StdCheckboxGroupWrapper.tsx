import { useStdId } from '@/hooks/common/useStdId';
import { getInitValues, prepareCheckboxes } from '@/shared/utils/checkboxGroupUtils';
import clsx from 'clsx';
import { ReactNode } from 'react';
import StdRequiredIndicator from '../stdRequiredIndicator/StdRequiredIndicator';

const HELPER_TEXT_CLASSES = 'text-caption mt-1';

const ERROR_HELPER_TEXT_CLASSES = clsx(HELPER_TEXT_CLASSES, 'text-error-600');

export type StdCheckboxGroupItem = {
  label: string;
  value: string;
  checked?: boolean;
};

export type StdCheckboxGroupProps = {
  name: string;
  children: ReactNode | ReactNode[];
  onChange: (value: string, status?: boolean, isCheckboxControl?: boolean) => void;
  checkedValues: string[];
  id?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  checkboxControl?: boolean;
  possibleValues?: string[];
};

const StdCheckboxGroupWrapper = ({
  label,
  children,
  onChange,
  checkedValues,
  name,
  required,
  error,
  helperText,
  disabled,
  possibleValues: possibleValuesProps,
  id: propsId,
}: StdCheckboxGroupProps) => {
  const possibleValues = possibleValuesProps ?? getInitValues(children).possibleValues;
  const id = useStdId('checkbox-group', propsId);

  return (
    <div className="flex flex-col text-left" role="group" id={id}>
      {label && (
        <span className="mb-2 text-body-m">
          {label} {required && <StdRequiredIndicator />}
        </span>
      )}
      <div>{prepareCheckboxes(children, checkedValues, possibleValues, name, onChange, disabled)}</div>
      {helperText && <span className={error ? ERROR_HELPER_TEXT_CLASSES : HELPER_TEXT_CLASSES}>{helperText}</span>}
    </div>
  );
};

export default StdCheckboxGroupWrapper;
