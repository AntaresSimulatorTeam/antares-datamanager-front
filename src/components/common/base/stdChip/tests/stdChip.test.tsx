/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { render, screen } from '@testing-library/react';

import StdChip from '../StdChip';

const TEST_LABEL = 'Label';
const TEST_ICON = StdIconId.Add;
const TEST_CLOSE = 'close';
const TEST_ID = 'my-chip';
const testOnClose = () => {};

describe('Std Chip', () => {
  it('renders the default Std Chip component', () => {
    render(<StdChip label={TEST_LABEL} />);
    const chip = screen.getByRole('listitem');
    expect(chip).toBeInTheDocument();
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
  });

  it('renders the StdChip with the proper id when specified', () => {
    render(<StdChip label={TEST_LABEL} id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the Std Chip component with icon + label', () => {
    render(<StdChip label={TEST_LABEL} icon={TEST_ICON} />);
    const chip = screen.getByRole('listitem');
    expect(chip).toBeInTheDocument();
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });

  it('renders the Std Chip component with label + delete', () => {
    render(<StdChip label={TEST_LABEL} onClose={testOnClose} />);
    const chip = screen.getByRole('listitem');
    expect(chip).toBeInTheDocument();
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
    expect(screen.getByTitle(TEST_CLOSE)).toBeInTheDocument();
  });

  it('renders the Std Chip component with icon + label + delete', () => {
    render(<StdChip label={TEST_LABEL} icon={TEST_ICON} onClose={testOnClose} />);
    const chip = screen.getByRole('listitem');
    expect(chip).toBeInTheDocument();
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
    expect(screen.getByTitle(TEST_CLOSE)).toBeInTheDocument();
  });

  it('renders the Std Chip component with icon only', () => {
    render(<StdChip icon={TEST_ICON} />);
    const chip = screen.getByRole('listitem');
    expect(chip).toBeInTheDocument();
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });
});
