/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '../StdIcon';

const TEST_ICON = StdIconId.Add;

describe('StdIcon', () => {
  it('renders StdIcon component', () => {
    render(<StdIcon name={TEST_ICON} />);
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });
});
