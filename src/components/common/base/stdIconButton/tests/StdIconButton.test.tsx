/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';

import StdIconButton from '../StdIconButton';
import { noop } from '@/shared/utils/common/defaultUtils';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

const TEST_ICON = StdIconId.Add;
const TEST_ID = 'my-button';

describe('StdIconButton', () => {
  it('renders the default StdIconButton component with icon', () => {
    render(<StdIconButton icon={TEST_ICON} onClick={noop} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });

  it('renders the StdIconButton with the proper id when specified', () => {
    render(<StdIconButton id={TEST_ID} icon={TEST_ICON} onClick={noop} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });
});
