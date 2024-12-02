/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { noop } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import StdCollapseIcon from '../StdCollapseIcon';

describe('StdCollapseIcon', () => {
  it('renders the StdCollapseIcon component with isOpen to true', () => {
    render(<StdCollapseIcon onClick={noop} isOpen />);
    expect(screen.getByTitle(StdIconId.KeyboardArrowDown)).toBeInTheDocument();
  });

  it('renders the StdCollapseIcon component with isOpen to false', () => {
    render(<StdCollapseIcon onClick={noop} isOpen={false} />);
    expect(screen.getByTitle(StdIconId.KeyboardArrowRight)).toBeInTheDocument();
  });
});
