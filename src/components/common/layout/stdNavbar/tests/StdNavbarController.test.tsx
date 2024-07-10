/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { noop } from '@/shared/utils/common/defaultUtils';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { render, screen } from '@testing-library/react';
import StdNavbarController from '../StdNavbarController';

const TEST_LABEL = 'Controls';
const TEST_ID = 'navbar-controller-id';

describe('StdNavbarController component', () => {
  it('should render the component with passed id', () => {
    render(<StdNavbarController label={TEST_LABEL} action={noop} id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });
  it('should render the proper content when expanded', () => {
    render(<StdNavbarController label={TEST_LABEL} action={noop} expanded id={TEST_ID} />);
    expect(screen.getByTitle(StdIconId.KeyboardDoubleArrowLeft)).toBeInTheDocument();
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
  });
  it('should render the proper content when expanded is false', () => {
    render(<StdNavbarController label={TEST_LABEL} action={noop} expanded={false} id={TEST_ID} />);
    expect(screen.getByTitle(StdIconId.KeyboardDoubleArrowRight)).toBeInTheDocument();
    expect(screen.queryByText(TEST_LABEL)).not.toBeInTheDocument();
  });
});
