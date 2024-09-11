/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import StdAvatarGroup from '../StdAvatarGroup';
import { generateFixedUsers } from '@/mocks/data/back/user.mocks';

const TEST_USER_UNIQUE = generateFixedUsers(1);
const TEST_USER_MULTIPLE = generateFixedUsers(5);
const TEST_SIZE = 'm';

describe('StdAvatarGroup', () => {
  it('renders StdAvatarGroup component with unique user', () => {
    render(<StdAvatarGroup users={TEST_USER_UNIQUE} avatarSize={TEST_SIZE} />);

    expect(screen.getAllByRole('figure').length == 1);
  });
});

describe('StdAvatarGroup', () => {
  it('renders StdAvatarGroup component with multiple user', () => {
    render(<StdAvatarGroup users={TEST_USER_MULTIPLE} avatarSize={TEST_SIZE} />);

    expect(screen.getAllByRole('figure').length == 3);
  });
});
