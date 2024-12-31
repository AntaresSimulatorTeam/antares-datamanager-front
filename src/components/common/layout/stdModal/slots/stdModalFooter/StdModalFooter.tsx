/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';

import { PropsWithChildren } from 'react';
import modalFooterClassBuilder from './modalFooterClassBuilder';

export type StdFooterInformation = {
  icon: StdIconId;
  text: string;
};
type StdModalFooterProps = {
  info?: StdFooterInformation;
};

const ICON_SIZE = 16;

export default function StdModalFooter({ children, info }: PropsWithChildren<StdModalFooterProps>) {
  const { containerClasses, childrenClasses, infoClasses } = modalFooterClassBuilder();
  return (
    <footer className={containerClasses} role="group">
      <div className={childrenClasses}>{children}</div>

      {info && (
        <span className={infoClasses} role="note">
          <StdIcon name={info.icon} width={ICON_SIZE} height={ICON_SIZE} />
          {info.text}
        </span>
      )}
    </footer>
  );
}
