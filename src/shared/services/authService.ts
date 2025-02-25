/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { isAuthenticationActive } from '@/shared/utils/authUtils.ts';

/**
 *
 * @param url
 * @param accessToken
 * @param options
 */
export const authFetch = async (url: string, accessToken?: string, options: RequestInit = {}): Promise<Response> => {
  if (isAuthenticationActive() && accessToken) {
    // Add Authorization header for different types of options.headers
    if (options.headers instanceof Headers) {
      options.headers.append('Authorization', `Bearer ${accessToken}`);
    } else if (Array.isArray(options.headers)) {
      options.headers.push(['Authorization', `Bearer ${accessToken}`]);
    } else {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
  }
  // Perform the fetch request
  return await fetch(url, options);
};
