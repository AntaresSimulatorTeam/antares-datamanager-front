/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { noop } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';

import StdTablePagination from '../StdTablePagination';

const TEST_ID = 'pagination';
const TEST_NEXT_ICON = StdIconId.KeyboardArrowRight;
const TEST_PREVIOUS_ICON = StdIconId.KeyboardArrowLeft;

describe('StdTablePagination', () => {
  it('renders the default StdTablePagination component with the proper id when specified', () => {
    render(<StdTablePagination id={TEST_ID} count={1} current={1} intervalSize={1} onChange={noop} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdTablePagination with the right next and previous icons', () => {
    render(<StdTablePagination count={1} current={1} intervalSize={1} onChange={noop} />);
    expect(screen.getByTitle(TEST_NEXT_ICON)).toBeInTheDocument();
    expect(screen.getByTitle(TEST_PREVIOUS_ICON)).toBeInTheDocument();
  });
});
