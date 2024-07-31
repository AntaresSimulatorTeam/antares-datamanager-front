/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';

export default <TValue>(value: TValue, initialValue: TValue) => {
  const ref = useRef(initialValue);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
