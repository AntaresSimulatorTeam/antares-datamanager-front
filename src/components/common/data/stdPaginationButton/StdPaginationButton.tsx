/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { paginationButtonClassBuilder } from './paginationButtonClassBuilder';

export interface StdPaginationButtonProps {
  id?: string;
  value: number;
  active?: boolean;
  onClick: () => void;
}

const StdPaginationButton = ({ id: propsId, value, active, onClick }: StdPaginationButtonProps) => {
  const { buttonClasses, numberClasses } = paginationButtonClassBuilder(!!active);
  const id = useStdId('pagination-btn', propsId);

  return (
    <button className={buttonClasses} onClick={onClick} onMouseDown={(e) => e.preventDefault()} id={id} type="button">
      <div className={numberClasses}>{value}</div>
    </button>
  );
};

export default StdPaginationButton;
