/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { fetchUsersByNni } from '@/shared/services/userService';

const userCache = new Map<string, { fullname: string; firstName: string; lastName: string }>();

/**
 * Hook to fetch user display name from NNI with caching
 *
 * @param {string} nni - User NNI
 * @return {Object} - User display information {fullname, firstName, lastName, isLoading, error}
 */
export const useUserDisplay = (nni: string) => {
  const [fullname, setFullname] = useState<string>(nni);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nni || nni.trim() === '') {
      return;
    }

    // Check cache first
    if (userCache.has(nni)) {
      const cached = userCache.get(nni)!;
      setFullname(cached.fullname);
      setFirstName(cached.firstName);
      setLastName(cached.lastName);
      return;
    }

    const loadUser = async () => {
      setIsLoading(true);
      try {
        const users = await fetchUsersByNni([nni]);
        if (users.length > 0) {
          const user = users[0];
          setFullname(user.fullname);
          setFirstName(user.firstName);
          setLastName(user.lastName);
          // Cache the result
          userCache.set(nni, {
            fullname: user.fullname,
            firstName: user.firstName,
            lastName: user.lastName,
          });
        }
      } catch (err) {
        setError((err as Error).message);
        console.error(`Failed to fetch user ${nni}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [nni]);

  return { fullname, firstName, lastName, isLoading, error };
};
