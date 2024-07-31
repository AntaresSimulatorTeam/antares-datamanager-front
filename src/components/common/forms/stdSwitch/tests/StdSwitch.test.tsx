/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import StdSwitch from '../StdSwitch';
const TEST_NAME = 'test';
const TEST_VALUE = '1';
const TEST_ID = 'my-switch';
const TEST_LABEL = 'label';

describe('StdSwitch', () => {
  it('renders the default StdSwitch component', () => {
    render(<StdSwitch label={TEST_LABEL} name={TEST_NAME} value={TEST_VALUE} />);
    const switchComponent = screen.getByRole('checkbox');
    expect(switchComponent).toBeInTheDocument();

    render(<StdSwitch label={TEST_LABEL} name={TEST_NAME} value={TEST_VALUE} id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdSwitch component with checked', () => {
    render(<StdSwitch label={TEST_LABEL} name={TEST_NAME} value={TEST_VALUE} checked />);
    const switchComponent = screen.getByRole('checkbox');
    expect(switchComponent).toBeInTheDocument();
    expect(switchComponent).toBeChecked();
  });

  it('renders the StdSwitch component with disabled', () => {
    render(<StdSwitch label={TEST_LABEL} name={TEST_NAME} value={TEST_VALUE} disabled />);
    const switchComponent = screen.getByRole('checkbox');
    expect(switchComponent).toBeInTheDocument();
    expect(switchComponent).toBeDisabled();
  });

  it('renders the StdSwitch component with checked and disabled', () => {
    render(<StdSwitch label={TEST_LABEL} name={TEST_NAME} value={TEST_VALUE} checked disabled />);
    const switchComponent = screen.getByRole('checkbox');
    expect(switchComponent).toBeInTheDocument();
    expect(switchComponent).toBeChecked();
    expect(switchComponent).toBeDisabled();
  });

  it('change checked status when checked prop changes', () => {
    const { rerender } = render(<StdSwitch label={TEST_LABEL} name={TEST_NAME} value={TEST_VALUE} checked />);
    const switchComponent: HTMLInputElement = screen.getByRole('checkbox');
    expect(switchComponent).toBeChecked();
    const NEW_VALUE = 'new-value';
    rerender(<StdSwitch label={TEST_LABEL} name={TEST_NAME} value={NEW_VALUE} checked={false} />);
    expect(switchComponent.checked).toBe(false);
  });
});
