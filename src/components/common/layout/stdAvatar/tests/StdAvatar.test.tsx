/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import StdAvatar from '../StdAvatar';

const TEST_USER = 'CT';
const TEST_SIZE = 'm';
const TEST_COLOR = 'purple';
const TEST_FULLNAME = 'Thomas Candille';

describe('StdAvatar', () => {
  it('render StdAvatar component', () => {
    render(<StdAvatar initials={TEST_USER} size={TEST_SIZE} backgroundColor={TEST_COLOR} fullname={TEST_FULLNAME} />);

    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByText(TEST_USER)).toBeInTheDocument();
  });
});
