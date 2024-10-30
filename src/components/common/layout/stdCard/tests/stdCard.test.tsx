/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StdCard from '../StdCard';

const onClick = vitest.fn();
const TEST_CHILDREN = <div role="article"></div>;
const TEST_ID = 'my-card';

describe('StdCard', () => {
  it('renders the default StdCard component', () => {
    render(<StdCard id={TEST_ID} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdCard component with children', () => {
    render(<StdCard>{TEST_CHILDREN}</StdCard>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders the StdCard component with onClick', async () => {
    render(<StdCard onClick={onClick} />);
    const card = screen.getByRole('region');
    await userEvent.click(card);
    expect(onClick).toBeCalled();
  });
});
