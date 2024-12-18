/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import { StdIconId } from '@/shared/utils/mappings/common/iconMaps';
import StdModalTitle from '../StdModalTitle';

const onClose = vitest.fn();
const TEST_CHILDREN = <div role="article"></div>;
const TEST_ICON = StdIconId.Warning;

describe('StdModalTitle', () => {
  it('render the default StdModalTitle', () => {
    render(<StdModalTitle onClose={onClose}>{TEST_CHILDREN}</StdModalTitle>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('render the StdModalTitle with icon', () => {
    render(
      <StdModalTitle onClose={onClose} icon={TEST_ICON}>
        {TEST_CHILDREN}
      </StdModalTitle>,
    );
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });
});
