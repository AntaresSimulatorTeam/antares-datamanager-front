/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import StdRadioButtonGroup from '../StdRadioButtonGroup';
import StdRadioButton from '../../stdRadioButton/StdRadioButton';

const TEST_NAME = 'radio-name';
const TEST_LABEL = 'test-label';
const TEST_ID = 'my-radio-button-group';
const TEST_CHECKED_POSITION = 1;

describe('StdRadioButtonGroup', () => {
  it('renders the default StdRadioButtonGroup component', () => {
    render(
      <StdRadioButtonGroup label={TEST_LABEL} name={TEST_NAME}>
        <StdRadioButton label="Option 1" value="op1" />
        <StdRadioButton label="Option 2" value="op2" />
        <StdRadioButton label="Option 3" value="op3" />
        <StdRadioButton label="Option 4" value="op4" />
      </StdRadioButtonGroup>,
    );
    const radioButton = screen.getByRole('radiogroup');
    expect(radioButton).toBeInTheDocument();
  });

  it('renders the StdRadioButtonGroup with the proper id when specified', () => {
    render(
      <StdRadioButtonGroup id={TEST_ID} label={TEST_LABEL} name={TEST_NAME}>
        <StdRadioButton label="Option 1" value="op1" />
        <StdRadioButton label="Option 2" value="op2" />
        <StdRadioButton label="Option 3" value="op3" />
        <StdRadioButton label="Option 4" value="op4" />
      </StdRadioButtonGroup>,
    );
    const radioButtonGroup = screen.getByRole('radiogroup');
    expect(radioButtonGroup).toBeInTheDocument();
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons.length).toBe(4);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdRadioButtonGroup component with disabled', () => {
    render(
      <StdRadioButtonGroup id={TEST_ID} label={TEST_LABEL} name={TEST_NAME} disabled>
        <StdRadioButton label="Option 1" value="op1" />
        <StdRadioButton label="Option 2" value="op2" />
        <StdRadioButton label="Option 3" value="op3" />
        <StdRadioButton label="Option 4" value="op4" />
      </StdRadioButtonGroup>,
    );
    const radioButtonGroup = screen.getByRole('radiogroup');
    expect(radioButtonGroup).toBeDisabled();
    const radioButtons = screen.getAllByRole('radio');
    radioButtons.forEach((radioButton) => expect(radioButton).toBeDisabled());
  });

  it('renders the StdRadioButtonGroup component with checked', () => {
    render(
      <StdRadioButtonGroup id={TEST_ID} label={TEST_LABEL} name={TEST_NAME}>
        <StdRadioButton label="Option 1" value="op1" />
        <StdRadioButton label="Option 2" value="op2" defaultChecked />
        <StdRadioButton label="Option 3" value="op3" />
        <StdRadioButton label="Option 4" value="op4" />
      </StdRadioButtonGroup>,
    );
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons[TEST_CHECKED_POSITION]).toBeChecked();
  });

  it('renders the StdRadioButtonGroup component with disabled + checked', () => {
    render(
      <StdRadioButtonGroup id={TEST_ID} label={TEST_LABEL} name={TEST_NAME} disabled>
        <StdRadioButton label="Option 1" value="op1" />
        <StdRadioButton label="Option 2" value="op2" defaultChecked />
        <StdRadioButton label="Option 3" value="op3" />
        <StdRadioButton label="Option 4" value="op4" />
      </StdRadioButtonGroup>,
    );
    const radioButtons = screen.getAllByRole('radio');
    radioButtons.forEach((radioButton) => expect(radioButton).toBeDisabled());
    expect(radioButtons[TEST_CHECKED_POSITION]).toBeChecked();
  });
});
