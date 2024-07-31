/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { PropsWithChildren } from 'react';

type StdTooltipProps = {
  id?: string;
};

const TOOLTIP_CLASSES = 'rounded bg-gray-800 px-1 py-0.5 text-caption font-semibold text-gray-w shadow-4';

const StdTooltip = ({ children, id: idProps }: PropsWithChildren<StdTooltipProps>) => {
  const id = useStdId('tooltip', idProps);
  return (
    <div className={TOOLTIP_CLASSES} role="tooltip" id={id}>
      {children}
    </div>
  );
};

export default StdTooltip;
