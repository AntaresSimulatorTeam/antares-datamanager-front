/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { useState } from 'react';
import StdInputText, { TextVariant } from '../StdInputText';

const TEST_LABEL = 'Label';
const TEST_HELPER = 'Helper';
const TEST_ID = 'Id';
const TEST_PLACEHOLDER = 'Placeholder';
const TEST_DEFAULT = 'default';
const TEST_VARIANT = 'test' as TextVariant;

const defaultInputSetup = () => {
  const onChange = vitest.fn();
  const component = render(
    <StdInputText
      label={TEST_LABEL}
      helperText={TEST_HELPER}
      id={TEST_ID}
      placeHolder={TEST_PLACEHOLDER}
      value={TEST_DEFAULT}
      variant={TEST_VARIANT}
      onChange={onChange}
    />,
  );
  const input: HTMLInputElement = screen.getByLabelText(TEST_LABEL);
  const label: HTMLSpanElement = screen.getByText(TEST_LABEL);
  const helper: HTMLSpanElement = screen.getByText(TEST_HELPER);
  return { ...component, input, label, helper, onChange };
};

describe('StdInputText', () => {
  it('renders the default StdInputText component', () => {
    const { input, label, helper } = defaultInputSetup();
    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(helper).toBeInTheDocument();
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('update Props should update display', () => {
    const { rerender, input, label, helper } = defaultInputSetup();
    const NEW_LABEL = 'TEST_LABEL';
    const NEW_HELPER = 'TEST_HELPER';
    const NEW_PLACEHOLDER = 'TEST_PLACEHOLDER';
    const NEW_DEFAULT = 'NEW_DEFAULT';
    rerender(
      <StdInputText
        label={NEW_LABEL}
        helperText={NEW_HELPER}
        placeHolder={NEW_PLACEHOLDER}
        variant={TEST_VARIANT}
        value={NEW_DEFAULT}
      />,
    );
    expect(input.value).toBe(NEW_DEFAULT);
    expect(label.textContent).toBe(NEW_LABEL);
    expect(helper.textContent).toBe(NEW_HELPER);
    expect(input.placeholder).toBe(NEW_PLACEHOLDER);
  });

  it('required should add "*" to the end of label', () => {
    const component = render(<StdInputText label={TEST_LABEL} required value="" />);
    const input: HTMLInputElement = screen.getByLabelText(TEST_LABEL);
    expect(input).toHaveAttribute('required');
    const star = screen.getByText('*');
    expect(star).toBeInTheDocument();
    component.rerender(<StdInputText label={TEST_LABEL} value="" />);
    expect(star).not.toBeInTheDocument();
  });

  const StatefulInputTextPassword = () => {
    const [value, setValue] = useState('');
    return <StdInputText label={TEST_LABEL} value={value} password onChange={(e) => setValue(e)} />;
  };
  it('password input should not display keys', async () => {
    const user = userEvent.setup();
    render(<StatefulInputTextPassword />);
    const input: HTMLInputElement = screen.getByLabelText(TEST_LABEL);
    expect(input.value).toBe('');

    await user.type(input, 'test');
    expect(input.value).toBe('test');
    expect(input).toHaveAttribute('type', 'password');
  });
});
