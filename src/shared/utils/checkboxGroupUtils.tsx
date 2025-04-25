import StdCheckbox, { StdCheckboxProps } from '@/components/forms/stdCheckbox/StdCheckbox';
import React, { PropsWithChildren, ReactElement, ReactNode } from 'react';

export const GET_ALL_VALUE = 'check_all';

const isCheckboxComponent = (child: ReactNode): child is React.ReactElement<StdCheckboxProps> =>
  React.isValidElement(child) && child.type === StdCheckbox;

export const getCheckState = (
  currentValues: string[] = [],
  possibleValues: string[],
  value?: string,
  checkboxControl?: boolean,
) => {
  if (checkboxControl) {
    return (
      possibleValues &&
      currentValues.filter((curVal) => possibleValues.includes(curVal)).length === possibleValues.length
    );
  }
  return !!value && currentValues.includes(value);
};

export const getIndeterminate = (currentValues: string[] | undefined, possibleValues: string[]) =>
  currentValues &&
  currentValues.filter((curVal) => possibleValues.includes(curVal)).length > 0 &&
  currentValues.filter((curVal) => possibleValues.includes(curVal)).length < possibleValues.length;

export const getValues = (
  children: ReactNode[] | ReactNode | ReactElement,
): { value: string; defaultChecked: boolean; disabled?: boolean }[] =>
  React.Children.toArray(children)
    .map((child) => {
      const childrenChild = (child as ReactElement<PropsWithChildren>).props.children;
      if (!React.isValidElement(child) || (isCheckboxComponent(child) && child.props.checkboxControl)) {
        return undefined;
      }

      if (isCheckboxComponent(child)) {
        return {
          value: child.props.value || '',
          defaultChecked: !!child.props.defaultChecked,
          disabled: child.props.disabled,
        };
      }

      return React.Children.count(childrenChild) ? getValues(childrenChild) : undefined;
    })
    .flat(Infinity)
    .filter((val) => !!val) as { value: string; defaultChecked: boolean }[];

export const getInitValues = (children: ReactNode[] | ReactNode | ReactElement) =>
  getValues(children).reduce(
    (acc, inc) => {
      if (inc.defaultChecked) {
        acc.defaultValues.push(inc.value);
      }

      if (!inc.disabled) {
        acc.possibleValues.push(inc.value);
      }
      if (inc.disabled && inc.defaultChecked) {
        acc.disabledCheckedValues.push(inc.value);
      }
      acc.allValues.push(inc.value);
      return acc;
    },
    { defaultValues: [], disabledCheckedValues: [], possibleValues: [], allValues: [] } as {
      defaultValues: string[];
      disabledCheckedValues: string[];
      possibleValues: string[];
      allValues: string[];
    },
  );

export const getDefaultValues = (children: ReactNode[] | ReactNode | ReactElement) =>
  getValues(children).reduce(
    (acc, inc) => {
      if (inc.defaultChecked) {
        acc.defaultValues.push(inc.value);
      }

      if (!inc.disabled) {
        acc.possibleValues.push(inc.value);
      }
      acc.allValues.push(inc.value);
      return acc;
    },
    { defaultValues: [], possibleValues: [], allValues: [] } as {
      defaultValues: string[];
      possibleValues: string[];
      allValues: string[];
    },
  );

export const prepareCheckboxes = (
  children: ReactNode | ReactNode[],
  currentValues: string[],
  possibleValues: string[],
  name: string,
  handleChange: (value: string, isChecked?: boolean, isCheckboxControl?: boolean) => void,
  disabled?: boolean,
): ReactNode[] =>
  React.Children.toArray(children).map((child, idx) => {
    if (!React.isValidElement(child)) {
      return;
    }
    const childrenChild = (child as ReactElement<PropsWithChildren>).props.children;
    if (!React.Children.count(childrenChild) && !isCheckboxComponent(child)) {
      return React.cloneElement(child, { key: child.key ?? idx });
    }
    if (isCheckboxComponent(child)) {
      return (
        <StdCheckbox
          {...child.props}
          key={child.props.checkboxControl ? 'checkboxControl' : child.props.value}
          defaultChecked={undefined}
          indeterminate={child.props.checkboxControl && getIndeterminate(currentValues, possibleValues)}
          checked={getCheckState(currentValues, possibleValues, child.props.value, child.props.checkboxControl)}
          disabled={disabled || child.props.disabled}
          onChange={(value?: boolean) => handleChange(child.props.value ?? '', value, child.props.checkboxControl)}
        />
      );
    }

    return React.cloneElement(child as ReactElement<PropsWithChildren>, {
      children: prepareCheckboxes(childrenChild, currentValues, possibleValues, name, handleChange, disabled),
    });
  });
