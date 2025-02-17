/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { User } from 'oidc-client-ts';

const USER_NAMES: string[] = [
  'John Doe',
  'Jane Smith',
  'Mike Johnson',
  'Emily Davis',
  'David Wilson',
  'John Smith',
  'Sarah Johnson',
  'Michael Brown',
  'Jennifer Davis',
  'Christopher Wilson',
  'Jessica Taylor',
  'Matthew Anderson',
  'Elizabeth Martinez',
  'Andrew Thompson',
  'Emily Hernandez',
  'Joshua Clark',
  'Samantha Lewis',
  'Daniel Lee',
  'Olivia Walker',
  'Joseph Hall',
  'Ashley Young',
  'David Allen',
  'Megan King',
  'James Scott',
  'Lauren Green',
  'Ryan Baker',
  'Amanda Adams',
  'Brandon Turner',
  'Stephanie Hill',
  'Justin Nelson',
];

export default USER_NAMES;

export const USER_FAKE = {
  access_token: '',
  expires_at: 1111,
  id_token: '',
  profile: {
    aud: '',
    email_verified: true,
    exp: 111111,
    family_name: 'Sacha',
    given_name: 'Compte fonctionnel',
    iat: 111111,
    iss: 'https://gaia-sso.opf.rte-france.com',
    locale: 'fr-FR',
    name: 'Compte fonctionnel Sacha',
    nickname: 'Sacha Nom26',
    preferred_username: 'Compte fonctionnel Sacha26',
    sub: 'CF92228T',
    website: 'https://www.rte-france.com',
    zonefinfo: 'Europe/Paris',
  },
  refresh_token: undefined,
  scope: 'openid email profile',
  session_date: null,
  session_state: null,
  state: undefined,
  token_type: 'Bearer',
  url_state: undefined,
  toStorageString: () => '',
  scopes: [],
  expires_in: undefined,
  expired: false,
} as User;
