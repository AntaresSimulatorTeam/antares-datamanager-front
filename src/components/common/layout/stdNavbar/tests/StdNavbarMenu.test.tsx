/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { menuTopData } from '@/mocks/data/features/menuData.mock';
import { renderWithRouter } from '@/shared/types';
import { screen } from '@testing-library/react';
import StdNavbarMenu from '../StdNavbarMenu';

describe('StdNavbarMenu component', () => {
  it('should render the component with the proper amount of items', () => {
    renderWithRouter(<StdNavbarMenu menuItems={menuTopData} />);
    expect(screen.getAllByRole('link').length).toBe(menuTopData.length);
    for (const item of menuTopData) {
      expect(screen.getByTitle(item.icon)).toBeInTheDocument();
    }
  });
  it('should display the labels when expanded is true', () => {
    renderWithRouter(<StdNavbarMenu menuItems={menuTopData} expanded />);
    for (const item of menuTopData) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });
});
