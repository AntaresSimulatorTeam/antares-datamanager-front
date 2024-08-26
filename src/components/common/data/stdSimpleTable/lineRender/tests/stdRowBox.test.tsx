/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdRowBox from '../StdRowBox';

const TEST_COMPONENT = <div role="article" />;

describe('StdRowBox', () => {
  it('renders the default StdRowBox component', () => {
    render(<StdRowBox>{TEST_COMPONENT}</StdRowBox>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
