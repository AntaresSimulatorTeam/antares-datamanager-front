/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSearchInput, { StdSearchInputProps } from '@common/forms/stdSearchInput/StdSearchInput';
import StdDivider from '../../stdDivider/StdDivider';

const HEADER_CLASSES = 'p-1 text-body-xs min-w-5 max-w-fit';
export const DROPDOWN_SEARCH_ID = 'dropdown-header-search-id';

const StdDropdownSearchHeader = (searchProps: StdSearchInputProps) => (
  <>
    <div className={HEADER_CLASSES}>
      <StdSearchInput id={DROPDOWN_SEARCH_ID} size="small" {...searchProps} />
    </div>
    <StdDivider />
  </>
);
export default StdDropdownSearchHeader;
