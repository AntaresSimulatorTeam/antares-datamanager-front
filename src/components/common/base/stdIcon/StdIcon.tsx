/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import Icon, { ExplicitIconProps, NonExplicitIconProps, PlainIconProps } from './Icon';

export type StdIconProps = (ExplicitIconProps | NonExplicitIconProps) & {
  name: StdIconId;
} & Omit<PlainIconProps, 'url'>;

const StdIcon = (props: StdIconProps) => <Icon {...props} url={`/icons/common/${props.name}.svg#icon`} />;

export default StdIcon;
