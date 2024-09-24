/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fakeAppName, fakeAppVersion, fakeHomeLink } from '@/mocks/data/components/navbarHeader';
import { menuBottomData, menuTopData } from '@/mocks/data/features/menuData.mock';
import { renderWithRouter } from '@/shared/types/common/tests/testUtils';
import { screen } from '@testing-library/react';
import StdNavbar from '../StdNavbar';

const TEST_ID = 'navbar';
const TOTAL_LENGTH = menuTopData.length + menuBottomData.length + 1; // Add one for the Header link

describe('StdNavbar component', () => {
  it('should render the navbar component with proper role and id, with the correct amount of sub items', () => {
    renderWithRouter(
      <StdNavbar
        appName={fakeAppName}
        appVersion={fakeAppVersion}
        headerLink={fakeHomeLink}
        topItems={menuTopData}
        bottomItems={menuBottomData}
        id={TEST_ID}
      />,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(document.querySelector(`#${TEST_ID}`));
    expect(screen.getAllByRole('link').length).toBe(TOTAL_LENGTH);
  });
});
