/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useTranslation } from 'react-i18next';
import StdButton from '../../base/stdButton/StdButton';

export type StdTablePaginationProps = {
  id?: string;
  count: number;
  current: number;
  intervalSize: number;
  onChange: (index: number) => void;
};

const StdTablePagination = ({ id: propsId, count, intervalSize, current, onChange }: StdTablePaginationProps) => {
  const { t } = useTranslation();
  const id = useStdId('table-pagination', propsId);

  const intervalStart = current * intervalSize + 1;
  const intervalEnd = Math.min((current + 1) * intervalSize, count);

  const handlePreviousClick = () => {
    if (current > 0) onChange(current - 1);
  };

  const handleNextClick = () => {
    if (current < Math.ceil(count / intervalSize) - 1) onChange(current + 1);
  };

  return (
    <div className="flex items-center gap-2" id={id} role="navigation">
      <label className="text-overnote font-semibold">
        {intervalStart}-{intervalEnd} {t('components.tablePagination.@of')} {count}
      </label>
      <div className="flex items-center gap-2">
        <StdButton
          icon={StdIconId.KeyboardArrowLeft}
          onClick={handlePreviousClick}
          disabled={current <= 0}
          id={`${id}-previous-button`}
          size="small"
          color="secondary"
          variant="transparent"
        />
        <StdButton
          icon={StdIconId.KeyboardArrowRight}
          onClick={handleNextClick}
          disabled={current >= Math.ceil(count / intervalSize) - 1}
          id={`${id}-next-button`}
          size="small"
          color="secondary"
          variant="transparent"
        />
      </div>
    </div>
  );
};

export default StdTablePagination;
