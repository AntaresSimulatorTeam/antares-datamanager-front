/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useRef, useState } from 'react';
import StdTextTooltip from '../stdTextTooltip/StdTextTooltip';
import { useCallOnResize } from '@/hooks/common/useCallOnResize';

type StdTextTooltipProps = { text: string; id: string | undefined } & React.HTMLProps<HTMLSpanElement>;

const DEFAULT_OFFSET = 8;

const StdTextWithTooltip = ({ text, id, ...props }: StdTextTooltipProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState<boolean>(false);

  useCallOnResize(() => {
    if (spanRef.current) {
      const { scrollHeight, clientHeight } = spanRef.current;
      setEnabled(clientHeight + 1 > scrollHeight);
    }
  }, spanRef.current?.id);

  return (
    <StdTextTooltip text={text} enabled={enabled} offset={DEFAULT_OFFSET}>
      <span ref={spanRef} {...props} id={id}>
        {text}
      </span>
    </StdTextTooltip>
  );
};

export default StdTextWithTooltip;
