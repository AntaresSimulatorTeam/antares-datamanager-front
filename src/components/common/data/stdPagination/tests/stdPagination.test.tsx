/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import { noop } from '@/shared/utils/common/defaultUtils';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdPagination from '../StdPagination';

const TEST_ID = 'pagination';
const TEST_NEXT_ICON = StdIconId.KeyboardArrowRight;
const TEST_PREVIOUS_ICON = StdIconId.KeyboardArrowLeft;

describe('StdPagination', () => {
  it('renders the default StdPagination component with the proper id', () => {
    render(<StdPagination lastPage={10} currentPage={1} id={TEST_ID} onChange={noop} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the default StdPagination component with the next and previous icons', () => {
    render(<StdPagination lastPage={10} currentPage={1} onChange={noop} />);
    expect(screen.getByTitle(TEST_NEXT_ICON)).toBeInTheDocument();
    expect(screen.getByTitle(TEST_PREVIOUS_ICON)).toBeInTheDocument();
  });

  it('renders the StdPagination with the correct pages numbers', () => {
    render(<StdPagination lastPage={10} currentPage={1} id={TEST_ID} onChange={noop} />);
    expect(document.querySelector(`#${TEST_ID}`)).toHaveTextContent('1');
    expect(document.querySelector(`#${TEST_ID}`)).not.toHaveTextContent('9');
  });
});
