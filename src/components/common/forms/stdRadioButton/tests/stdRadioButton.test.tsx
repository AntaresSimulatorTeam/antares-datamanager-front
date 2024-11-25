/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import StdRadioButton from '../StdRadioButton';

const TEST_LABEL = 'label';
const TEST_VALUE = 'test-value';
const TEST_NAME = 'radio-name';
const TEST_ID = 'my-radio-radioButton';

describe('StdRadioButton', () => {
  it('renders the default StdRadioButton component', () => {
    render(<StdRadioButton label={TEST_LABEL} name={TEST_NAME} value={TEST_VALUE} />);
    const radioButton = screen.getByRole('radio');
    expect(radioButton).toBeInTheDocument();
  });

  it('renders the StdRadioButton with the proper id when specified', () => {
    render(<StdRadioButton label={TEST_LABEL} id={TEST_ID} name={TEST_NAME} value={TEST_VALUE} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdRadioButton component with disabled', () => {
    render(<StdRadioButton label={TEST_LABEL} id={TEST_ID} name={TEST_NAME} value={TEST_VALUE} disabled />);
    const radioButton = screen.getByRole('radio');
    expect(radioButton).toBeInTheDocument();
    expect(radioButton).toBeDisabled();
  });

  it('renders the StdRadioButton component with checked', () => {
    render(<StdRadioButton label={TEST_LABEL} id={TEST_ID} name={TEST_NAME} value={TEST_VALUE} defaultChecked />);
    const radioButton = screen.getByRole('radio');
    expect(radioButton).toBeInTheDocument();
    expect(radioButton).toBeChecked();
  });

  it('renders the StdRadioButton component with disabled + checked', () => {
    render(
      <StdRadioButton label={TEST_LABEL} id={TEST_ID} name={TEST_NAME} value={TEST_VALUE} defaultChecked disabled />,
    );
    const radioButton = screen.getByRole('radio');
    expect(radioButton).toBeInTheDocument();
    expect(radioButton).toBeDisabled();
    expect(radioButton).toBeChecked();
  });
});
