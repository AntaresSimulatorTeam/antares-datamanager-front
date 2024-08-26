/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdDefaultRenderCell from '../StdDefaultRenderCell';

const TEST_COMPONENT = <div role="article" />;

describe('StdDefaultRenderCell', () => {
  it('renders the default StdDefaultRenderCell', () => {
    render(<StdDefaultRenderCell>{TEST_COMPONENT}</StdDefaultRenderCell>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
