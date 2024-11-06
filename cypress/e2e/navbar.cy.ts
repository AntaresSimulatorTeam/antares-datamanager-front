/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import i18next from '@/i18n';
import { menuItemSample } from '@/mocks/data/features/menuItemData.mock';
import { APP_LOGO_ID, PEGASE_NAVBAR_ID } from '@/shared/constants';

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
    navbarController.should('not.contain', minimizeText);
    navbarController.trigger('mouseover');
    const navbarControllerFloating = cy.get(`#${PEGASE_NAVBAR_ID}-controller-floating`);
    navbarControllerFloating.should('contain', expendsText);
    navbar.get(`#${APP_LOGO_ID}`).should('exist');

    navbarController.click();
    navbarControllerFloating.should('not.contain', expendsText);
    navbarController.should('contain', minimizeText);
    navbar.get(`#${APP_LOGO_ID}`).should('exist');
  });

  it('displays items and handle clicking properly', () => {
    const firstLink = menuItemSample;
    const firstItem = cy.get(`#${firstLink.id}`);
    firstItem.should('contain', firstLink.label);

    firstItem.click();
    cy.url().should('include', firstLink.path);
  });

  it('displays items and handle clicking properly when the navbar is collapsed', () => {
    const navbarController = cy.get(`#${PEGASE_NAVBAR_ID}-controller`);
    navbarController.click();

    const firstLink = menuItemSample;
    const firstItem = cy.get(`#${firstLink.id}`);
    firstItem.should('not.contain', firstLink.label);

    firstItem.click();
    cy.url().should('include', firstLink.path);
  });
});
