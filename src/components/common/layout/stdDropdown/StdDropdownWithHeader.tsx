/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdDropdown, { StdDropdownProps } from './StdDropdown';
import StdDropdownHeader from './subComponents/StdDropdownHeader';

type StdDropdownWithHeaderProps = StdDropdownProps & { header: string };

const StdDropdownWithHeader = ({ header, ...dropdownProps }: StdDropdownWithHeaderProps) => (
  <>
    <StdDropdown {...dropdownProps} header={<StdDropdownHeader header={header} />} />
  </>
);

export default StdDropdownWithHeader;
