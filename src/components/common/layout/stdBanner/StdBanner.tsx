/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/useStdId';
import { DisplayStatus } from '@/shared/types/common/DisplayStatus.type';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

import { MouseEventHandler } from 'react';
import StdButton from '../../base/stdButton/StdButton';
import StdIcon from '../../base/stdIcon/StdIcon';
import { bannerClassBuilder } from './bannerClassBuilder';

const DEFAULT_ICON = {
  success: StdIconId.Done,
  error: StdIconId.Report,
  warning: StdIconId.Warning,
  info: StdIconId.Info,
};

export interface StdBannerProps {
  message: string;
  id?: string;
  status?: DisplayStatus;
  icon?: StdIconId;
  onClose?: MouseEventHandler<HTMLButtonElement>;
}

const ICON_SIZE = 24;

const StdBanner = ({ message, id: propsId, status = 'info', icon, onClose }: StdBannerProps) => {
  const { containerClasses, iconClasses, textClasses } = bannerClassBuilder(status);
  const id = useStdId('banner', propsId);

  return (
    <div id={id} className={containerClasses} role="alert">
      <div className={iconClasses}>
        <StdIcon name={icon ?? DEFAULT_ICON[status]} width={ICON_SIZE} height={ICON_SIZE} />
      </div>
      <span className={textClasses}>{message}</span>
      {onClose && (
        <StdButton icon={StdIconId.Close} variant="transparent" size="small" color="secondary" onClick={onClose} />
      )}
    </div>
  );
};

export default StdBanner;
