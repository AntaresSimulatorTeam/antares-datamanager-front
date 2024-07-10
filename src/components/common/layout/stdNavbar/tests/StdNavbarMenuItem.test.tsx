/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { menuItemSample } from '@/mocks/data/features/menuItemData.mock';
import { renderWithRouter } from '@/shared/types';
import { screen } from '@testing-library/react';
import StdNavbarMenuItem from '../StdNavbarMenuItem';

describe('StdNavbarMenuItem component', () => {
  it('should render the component with the default behavior and proper id', () => {
    renderWithRouter(<StdNavbarMenuItem item={menuItemSample} />);
    expect(document.querySelector(`#${menuItemSample.id}`)).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByTitle(menuItemSample.icon)).toBeInTheDocument();
  });
  it('should render the item label if expanded is true', () => {
    renderWithRouter(<StdNavbarMenuItem item={menuItemSample} expanded />);
    expect(screen.getByText(menuItemSample.label)).toBeInTheDocument();
  });
  it('should not render the item label if expanded is not true', () => {
    renderWithRouter(<StdNavbarMenuItem item={menuItemSample} expanded={false} />);
    expect(screen.queryByText(menuItemSample.label)).not.toBeInTheDocument();
  });
});
