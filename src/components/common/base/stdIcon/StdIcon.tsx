/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import Icon, { IconProps } from './Icon';

export type StdIconProps = {
  name: StdIconId;
} & Omit<IconProps, 'url'>;

// Must explicit 'isExplicit' to fix TypeScript error
const StdIcon = ({ isExplicit, alt, ...otherProps }: StdIconProps) =>
  isExplicit === false ? (
    <Icon isExplicit={false} alt={alt as string} {...otherProps} url={`/icons/common/${otherProps.name}.svg#icon`} />
  ) : (
    <Icon isExplicit={true} {...otherProps} url={`/icons/common/${otherProps.name}.svg#icon`} />
  );

export default StdIcon;
