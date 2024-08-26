/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren } from 'react';

const StdRenderCell = ({ children }: PropsWithChildren) => (
  <div className="flex h-4 items-center">
    <span className="line-clamp-1">{children}</span>
  </div>
);

export default StdRenderCell;
