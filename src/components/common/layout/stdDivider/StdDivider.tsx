/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { dividerClassBuilder } from './dividerClassBuilder';

export type StdDividerProps = {
  extraClasses?: string;
};

const StdDivider = ({ extraClasses }: StdDividerProps) => {
  const dividerClasses = dividerClassBuilder(extraClasses);
  return <hr className={dividerClasses} role="separator" />;
};

export default StdDivider;
