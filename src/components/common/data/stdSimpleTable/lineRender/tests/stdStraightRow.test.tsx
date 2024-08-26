/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdStraightRow from '../StdStraightRow';

describe('StdStraightRow', () => {
  it('renders the default StdStraightRow component', () => {
    render(<StdStraightRow headers={[]} row={{ key: 'id', data: {} }} />);
    expect(screen.getByRole('row')).toBeInTheDocument();
  });
});
