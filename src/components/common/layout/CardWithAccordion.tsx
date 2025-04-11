import { WarningMessage } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { useTranslation } from 'react-i18next';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { useState } from 'react';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';
import { RdsDivider } from 'rte-design-system-react';

type CardWithAccordionProps = {
  data: WarningMessage;
  index: number;
  nbItems: number;
};

export const CardWithAccordion = ({ data, index, nbItems }: CardWithAccordionProps) => {
  const { t } = useTranslation();
  const color = data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? 'text-error-700' : 'text-warning-500';
  const colorBg = data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? 'bg-red-700' : 'bg-acc6-500';
  const colorBorder = data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? 'border-acc4-700' : 'border-acc6-500';
  const [isOpen, setIsOpen] = useState(false);
  const getBorderRadius = () =>
    nbItems === 1
      ? 'rounded-l-lg'
      : index === 0
        ? 'rounded-tl-lg'
        : index === nbItems - 1
          ? 'rounded-bl-lg'
          : 'rounded-none';

  return (
    <>
      <div
        className={`h-${isOpen ? 24 : 10} overflow-hidden ${getBorderRadius()} border-s-4 border-solid ${colorBorder} p-2 transition-height duration-500 ease-in-out hover:${colorBg} bg-opacity-30`}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <StdIcon
              name={data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? StdIconId.Info : StdIconId.Warning}
              color={`${color}`}
            />
            <span
              className={`${color}`}
            >{`${data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? t('studyDetails.@import_status_error') : t('studyDetails.@import_status_warning')}`}</span>
          </div>
          <div className="flex">
            <button onClick={() => setIsOpen((prev) => !prev)}>
              <StdIcon name={isOpen ? StdIconId.KeyboardArrowUp : StdIconId.KeyboardArrowDown} />
            </button>
          </div>
        </div>
        <div className="mt-1 flex justify-start">{data.secondTrajectory}</div>
        <div className="my-1 text-wrap text-start text-gray-600">{data.content}</div>
        <div className="flex gap-2 text-gray-600">
          <div className="flex items-center gap-1">
            <StdIcon name={StdIconId.Person} />
            {data.generatedBy}
          </div>
          {'|'}
          <div className="flex items-center gap-1">
            <StdIcon name={StdIconId.History} />
            {data.generatedAt ? formatDateToDDMMYYYY(data.generatedAt) : ''}
          </div>
        </div>
      </div>
      {index !== Math.max(0, nbItems - 1) && <RdsDivider />}
    </>
  );
};
