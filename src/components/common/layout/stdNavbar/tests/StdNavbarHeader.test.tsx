/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fakeAppName, fakeAppVersion, fakeHomeLink, fakeTwoLetters } from '@/mocks/data/components/navbarHeader';
import { renderWithRouter } from '@/shared/types';
import { screen } from '@testing-library/react';
import StdNavbarHeader from '../StdNavbarHeader';

const TEST_ID = 'navbar-header';

describe('StdNavbarHeader component', () => {
  it('should render the wrapper and the common content', () => {
    renderWithRouter(
      <StdNavbarHeader
        appTwoLetters={fakeTwoLetters}
        appName={fakeAppName}
        version={fakeAppVersion}
        target={fakeHomeLink}
        id={TEST_ID}
      />,
    );
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByText(fakeTwoLetters)).toBeInTheDocument();
  });
  it('should render appName and version if expanded', () => {
    renderWithRouter(
      <StdNavbarHeader
        appTwoLetters={fakeTwoLetters}
        appName={fakeAppName}
        version={fakeAppVersion}
        target={fakeHomeLink}
        id={TEST_ID}
        expanded
      />,
    );
    expect(screen.getByText(fakeAppName)).toBeInTheDocument();
    expect(screen.getByText(fakeAppVersion)).toBeInTheDocument();
  });
  it('should not render appName and version if expanded is false', () => {
    renderWithRouter(
      <StdNavbarHeader
        appTwoLetters={fakeTwoLetters}
        appName={fakeAppName}
        version={fakeAppVersion}
        target={fakeHomeLink}
        id={TEST_ID}
        expanded={false}
      />,
    );
    expect(screen.queryByText(fakeAppName)).not.toBeInTheDocument();
    expect(screen.queryByText(fakeAppVersion)).not.toBeInTheDocument();
  });
});
