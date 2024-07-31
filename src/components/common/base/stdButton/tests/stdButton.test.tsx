/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdButton from '../StdButton';

const TEST_LABEL = 'Label';
const TEST_ICON = StdIconId.Add;
const TEST_ID = 'my-button';

describe('StdButton', () => {
  it('renders the default StdButton component', () => {
    render(<StdButton label={TEST_LABEL} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe(TEST_LABEL);
  });

  it('renders the StdButton with the proper id when specified', () => {
    render(<StdButton label={TEST_LABEL} id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdButton component with icon + label', () => {
    render(<StdButton label={TEST_LABEL} icon={TEST_ICON} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain(TEST_LABEL);
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });

  it('renders the StdButton component with icon and no label', () => {
    render(<StdButton icon={TEST_ICON} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });
});
