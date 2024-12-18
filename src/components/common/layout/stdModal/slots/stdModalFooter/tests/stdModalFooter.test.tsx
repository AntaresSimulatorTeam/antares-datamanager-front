/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdButton from '@/components/common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/mappings/common/iconMaps';
import { render, screen } from '@testing-library/react';
import StdModalFooter, { StdFooterInformation } from '../StdModalFooter';

const TEST_BUTTON = <StdButton label="button" />;
const TEST_BUTTONS_ARRAY = [
  <StdButton label="button" key="1" />,
  <StdButton label="button" key="2" />,
  <StdButton label="button" key="3" />,
];
const TEST_TEXT_INFORMATION = 'Information';
const TEST_ICON_INFORMATION = StdIconId.Info;
const TEST_INFORMATION: StdFooterInformation = {
  icon: TEST_ICON_INFORMATION,
  text: TEST_TEXT_INFORMATION,
};

describe('StdModalFooter', () => {
  it('renders the default StdModalFooter', () => {
    render(<StdModalFooter>{TEST_BUTTON}</StdModalFooter>);
    const footer = screen.getByRole('group');
    expect(footer).toBeInTheDocument();
  });

  it('render the StdModalFooter with a defined number of buttons', () => {
    render(
      <StdModalFooter>
        {TEST_BUTTONS_ARRAY.map((btn, idx) => (
          <span key={idx}>{btn}</span>
        ))}
      </StdModalFooter>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(TEST_BUTTONS_ARRAY.length);
  });

  it('render the StdModalFooter with only one button', () => {
    render(<StdModalFooter>{TEST_BUTTON}</StdModalFooter>);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
  });

  it('render the StdModalFooter with an information', () => {
    render(<StdModalFooter info={TEST_INFORMATION}>{TEST_BUTTON}</StdModalFooter>);
    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(screen.getByTitle(TEST_ICON_INFORMATION)).toBeInTheDocument();
    expect(screen.getByText(TEST_TEXT_INFORMATION)).toBeInTheDocument();
  });
});
