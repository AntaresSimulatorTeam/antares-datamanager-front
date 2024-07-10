/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdTooltip from '../StdTooltip';

const TEST_ID = 'tooltip-test-id';
const TEST_CONTENT = 'My tooltip';

describe('StdTooltip component', () => {
  it('renders the tooltip with the proper id and role', () => {
    render(<StdTooltip id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('renders the tooltip with the proper content', () => {
    render(<StdTooltip id={TEST_ID}>{TEST_CONTENT}</StdTooltip>);
    expect(screen.getByText(TEST_CONTENT)).toBeInTheDocument();
  });
});
