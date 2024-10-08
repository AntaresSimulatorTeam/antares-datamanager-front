/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import { noop } from '@/shared/utils/common/defaultUtils';
import StdPaginationButton from '../StdPaginationButton';

const TEST_ID = 'my-button';

describe('StdPaginationButton', () => {
  it('renders the default StdPaginationButton component', () => {
    render(<StdPaginationButton value={1} onClick={noop} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders the StdPaginationButton with the proper id when specified', () => {
    render(<StdPaginationButton id={TEST_ID} value={1} onClick={noop} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });
});
