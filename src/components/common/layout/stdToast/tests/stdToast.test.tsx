/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { noop } from '@/shared/utils/common/defaultUtils';
import { render, screen } from '@testing-library/react';

import StdToast from '../StdToast';

const TEST_MESSAGE = 'my-message';
const TEST_ID = 'my-toast';
const TEST_ACTION = {
  label: 'test-action',
  onClick: noop,
};

describe('StdToast', () => {
  it('renders the default StdToast component', () => {
    render(<StdToast message={TEST_MESSAGE} />);
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
  });

  it('renders the StdToast with the proper id when specified', () => {
    render(<StdToast message={TEST_MESSAGE} id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdToast component with action', () => {
    render(<StdToast message={TEST_MESSAGE} action={TEST_ACTION} />);
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast.textContent).toContain(TEST_MESSAGE);
    const actionButton = screen.getByRole('button');
    expect(actionButton).toBeInTheDocument();
    expect(actionButton.textContent).toBe(TEST_ACTION.label);
  });
});
