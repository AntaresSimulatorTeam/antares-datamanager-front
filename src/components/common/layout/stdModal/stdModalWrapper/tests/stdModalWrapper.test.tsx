/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdModalWrapper from '../StdModalWrapper';

const TEST_CHILDREN = <div role="article">Content</div>;

describe('StdModalWrapper', () => {
  it('render the stdModalWrapper component', () => {
    render(<StdModalWrapper>{TEST_CHILDREN}</StdModalWrapper>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
