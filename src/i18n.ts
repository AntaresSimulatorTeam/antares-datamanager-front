/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import i18n from 'i18next';
import translationsEn from 'public/i18n/en.json' assert { type: 'json' };
import translationsFr from 'public/i18n/fr.json' assert { type: 'json' };
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: translationsEn,
  },
  fr: {
    translation: translationsFr,
  },
};

await i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
