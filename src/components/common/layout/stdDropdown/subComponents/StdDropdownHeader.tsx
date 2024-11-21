/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdDivider from '../../stdDivider/StdDivider';

const HEADER_CLASSES = 'p-1 text-body-xs min-w-5 max-w-fit';

const StdDropdownHeader = ({ header }: { header: string }) => (
  <>
    <div className={HEADER_CLASSES}>
      <span className="line-clamp-2">{header}</span>
    </div>
    <StdDivider />
  </>
);
export default StdDropdownHeader;
