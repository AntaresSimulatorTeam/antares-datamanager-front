import { fireEvent, render, screen } from '@testing-library/react';

import { noop } from '@/shared/utils/defaultUtils';
import StdCheckbox from '../../stdCheckbox/StdCheckbox';
import StdCheckboxGroupWrapper from '../StdCheckboxGroupWrapper';

const TEST_LABEL = 'My checkboxes';
const TEST_CHECKBOX_CONTROL_LABEL = 'My control checkbox';
const TEST_CHECKBOXES_VALUES = ['test1', 'test2', 'test3', 'test4', 'test5', 'test6'];
const TEST_ID = 'my-checkboxes';
const TEST_NAME = 'test-checkboxes';
const TEST_CHECKBOXES_NUMBER = 6;
const TEST_DISBLED_CHECKBOXES = ['test3', 'test6'];
const TEST_CHECKED_CHECKBOXES = ['test1', 'test5'];
const TEST_CHECKBOXES = TEST_CHECKBOXES_VALUES.map((value, idx) =>
  idx % 2 === 0 ? (
    <div key={idx}>
      <StdCheckbox value={value} disabled={TEST_DISBLED_CHECKBOXES.includes(value)} />
    </div>
  ) : (
    <StdCheckbox key={idx} value={value} disabled={TEST_DISBLED_CHECKBOXES.includes(value)} />
  ),
);

describe('StdCheckbox', () => {
  it('basic StdCheckboxGroupWrapper component', () => {
    render(
      <StdCheckboxGroupWrapper id={TEST_ID} name={TEST_NAME} label={TEST_LABEL} onChange={noop} checkedValues={[]}>
        {TEST_CHECKBOXES}
      </StdCheckboxGroupWrapper>,
    );
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the expected number of checkboxes', () => {
    render(
      <StdCheckboxGroupWrapper id={TEST_ID} name={TEST_NAME} label={TEST_LABEL} onChange={noop} checkedValues={[]}>
        {TEST_CHECKBOXES}
      </StdCheckboxGroupWrapper>,
    );

    expect(screen.getAllByRole('checkbox').length).toBe(TEST_CHECKBOXES_NUMBER);
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the expected number of checked checkboxes', () => {
    render(
      <StdCheckboxGroupWrapper
        id={TEST_ID}
        name={TEST_NAME}
        label={TEST_LABEL}
        onChange={noop}
        checkedValues={TEST_CHECKED_CHECKBOXES}
      >
        {TEST_CHECKBOXES}
      </StdCheckboxGroupWrapper>,
    );

    expect(screen.getAllByRole('checkbox').filter((element) => (element as HTMLInputElement).checked).length).toBe(
      TEST_CHECKED_CHECKBOXES.length,
    );
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the expected number of checked checkboxes', () => {
    render(
      <StdCheckboxGroupWrapper
        id={TEST_ID}
        name={TEST_NAME}
        label={TEST_LABEL}
        onChange={noop}
        checkedValues={TEST_CHECKED_CHECKBOXES}
      >
        {TEST_CHECKBOXES}
      </StdCheckboxGroupWrapper>,
    );

    expect(screen.getAllByRole('checkbox').filter((element) => (element as HTMLInputElement).checked).length).toBe(
      TEST_CHECKED_CHECKBOXES.length,
    );
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the expected number of disabled checkboxes', () => {
    render(
      <StdCheckboxGroupWrapper
        id={TEST_ID}
        name={TEST_NAME}
        label={TEST_LABEL}
        onChange={noop}
        checkedValues={TEST_CHECKED_CHECKBOXES}
      >
        {TEST_CHECKBOXES}
      </StdCheckboxGroupWrapper>,
    );

    expect(screen.getAllByRole('checkbox').filter((element) => (element as HTMLInputElement).disabled).length).toBe(
      TEST_DISBLED_CHECKBOXES.length,
    );
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the checkboxControl', () => {
    render(
      <StdCheckboxGroupWrapper
        id={TEST_ID}
        name={TEST_NAME}
        label={TEST_LABEL}
        onChange={noop}
        checkedValues={TEST_CHECKED_CHECKBOXES}
      >
        <div>
          <StdCheckbox label={TEST_CHECKBOX_CONTROL_LABEL} checkboxControl />
          {TEST_CHECKBOXES}
        </div>
      </StdCheckboxGroupWrapper>,
    );

    expect(screen.getByText(TEST_CHECKBOX_CONTROL_LABEL)).toBeInTheDocument();
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the checkboxControl with indeterminate attribute at true due to some checked checkbox', () => {
    render(
      <StdCheckboxGroupWrapper
        id={TEST_ID}
        name={TEST_NAME}
        label={TEST_LABEL}
        onChange={noop}
        checkedValues={TEST_CHECKED_CHECKBOXES}
      >
        <div>
          <StdCheckbox label={TEST_CHECKBOX_CONTROL_LABEL} checkboxControl />
          {TEST_CHECKBOXES}
        </div>
      </StdCheckboxGroupWrapper>,
    );

    expect(
      screen.getAllByRole('checkbox').find((element) => (element as HTMLInputElement).indeterminate),
    ).toBeDefined();
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the checkboxControl with indeterminate attribute at true due to all enabled and checked checkbox', () => {
    render(
      <StdCheckboxGroupWrapper
        id={TEST_ID}
        name={TEST_NAME}
        label={TEST_LABEL}
        onChange={noop}
        checkedValues={TEST_CHECKBOXES_VALUES.filter((val) => !TEST_DISBLED_CHECKBOXES.includes(val))}
      >
        <div>
          <StdCheckbox label={TEST_CHECKBOX_CONTROL_LABEL} checkboxControl />
          {TEST_CHECKBOXES}
        </div>
      </StdCheckboxGroupWrapper>,
    );

    expect(
      screen.getAllByRole('checkbox').find((element) => (element as HTMLInputElement).indeterminate),
    ).not.toBeDefined();

    expect(
      screen.getAllByRole('checkbox').find((element) => (element as HTMLInputElement).value === 'checkbox_control'),
    ).toBeChecked();
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the checkboxControl with indeterminate attribute at false due to all unchecked checkbox', () => {
    render(
      <StdCheckboxGroupWrapper id={TEST_ID} name={TEST_NAME} label={TEST_LABEL} onChange={noop} checkedValues={[]}>
        <div>
          <StdCheckbox label={TEST_CHECKBOX_CONTROL_LABEL} checkboxControl />
          {TEST_CHECKBOXES}
        </div>
      </StdCheckboxGroupWrapper>,
    );

    expect(
      screen.getAllByRole('checkbox').find((element) => (element as HTMLInputElement).indeterminate),
    ).not.toBeDefined();

    expect(
      screen.getAllByRole('checkbox').find((element) => (element as HTMLInputElement).value === 'checkbox_control'),
    ).not.toBeChecked();
  });

  it('StdCheckboxGroupWrapper component with checkboxes children with the checkboxControl with indeterminate attribute at false due to all unchecked checkbox', () => {
    render(
      <StdCheckboxGroupWrapper id={TEST_ID} name={TEST_NAME} label={TEST_LABEL} onChange={noop} checkedValues={[]}>
        <div>
          <StdCheckbox label={TEST_CHECKBOX_CONTROL_LABEL} checkboxControl />
          {TEST_CHECKBOXES}
        </div>
      </StdCheckboxGroupWrapper>,
    );

    expect(
      screen.getAllByRole('checkbox').find((element) => (element as HTMLInputElement).indeterminate),
    ).not.toBeDefined();

    expect(
      screen.getAllByRole('checkbox').find((element) => (element as HTMLInputElement).value === 'checkbox_control'),
    ).not.toBeChecked();
  });

  it('Should trigger onChange when the checkbox control value change', () => {
    const onChange = vitest.fn();
    render(
      <StdCheckboxGroupWrapper
        id={TEST_ID}
        name={TEST_NAME}
        label={TEST_LABEL}
        onChange={onChange}
        checkedValues={TEST_CHECKBOXES_VALUES.filter((val) => !TEST_DISBLED_CHECKBOXES.includes(val))}
      >
        <div>
          <StdCheckbox label={TEST_CHECKBOX_CONTROL_LABEL} checkboxControl />
          {TEST_CHECKBOXES}
        </div>
      </StdCheckboxGroupWrapper>,
    );

    const checkboxes: HTMLInputElement[] = screen.getAllByRole('checkbox');
    const [checkboxControlElement] = checkboxes;

    expect(checkboxControlElement.value).toBe('checkbox_control');

    fireEvent.click(checkboxControlElement, { target: { value: false } });

    expect(onChange).toBeCalledWith('', false, true);
  });
});
