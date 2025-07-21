/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import i18next from '@/i18n';
import { APP_LOGO_ID, PEGASE_NAVBAR_ID } from '@/shared/constants';
import { menuTopData } from '@/mocks/data/features/navbar.mock.ts';

describe('Navbar behavior', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('navbar should be visible and expanded', () => {
    const navbar = cy.get(`#${PEGASE_NAVBAR_ID}`);
    const minimizeText = i18next.t('components.navbar.@minimize');
    navbar.should('be.visible');
    navbar.get(`#${APP_LOGO_ID}`).should('exist');
    const navbarController = cy.get(`#${PEGASE_NAVBAR_ID}-controller`);
    navbarController.should('contain', minimizeText);
  });

  it('navbar should collapse/expand when the controller is clicked', () => {
    const minimizeText = i18next.t('components.navbar.@minimize');
    const expendsText = i18next.t('components.navbar.@expand');
    const navbar = cy.get(`#${PEGASE_NAVBAR_ID}`);
    const navbarController = cy.get(`#${PEGASE_NAVBAR_ID}-controller`);

    navbarController.should('contain', minimizeText);
    navbarController.click();
    navbarController.should('contain', expendsText);
    navbar.get(`#${APP_LOGO_ID}`).should('exist');
    navbarController.click();
    navbarController.should('contain', minimizeText);
    navbar.get(`#${APP_LOGO_ID}`).should('exist');
  });

  it('displays items and handle clicking properly', () => {
    const firstLinkData = menuTopData[0];
    const firstItem = cy.get(`#${firstLinkData.id}`);
    firstItem.should('contain', firstLinkData.label);

    firstItem.click();
    cy.url().should('include', '/');
  });

  it('displays items and handle clicking properly', () => {
    const secondLinkData = menuTopData[1];
    const secondItem = cy.get(`#${secondLinkData.id}`);
    secondItem.should('contain', secondLinkData.label);

    secondItem.click();
    cy.url().should('include', secondLinkData.path);
  });

  it('displays items and handle clicking properly when the navbar is collapsed', () => {
    cy.get(`#${PEGASE_NAVBAR_ID}-controller`).click();
    const firstLink = menuTopData[0];
    const firstItem = cy.get(`#${firstLink.id}`);
    firstItem.should('not.contain', firstLink.label);

    firstItem.click();
    cy.url().should('include', firstLink.path);
  });

  it('displays items and handle clicking properly when the navbar is collapsed', () => {
    cy.get(`#${PEGASE_NAVBAR_ID}-controller`).click();
    const secondLink = menuTopData[1];
    const secondItem = cy.get(`#${secondLink.id}`);
    secondItem.should('not.contain', secondLink.label);

    secondItem.click();
    cy.url().should('include', secondLink.path);
  });
});
