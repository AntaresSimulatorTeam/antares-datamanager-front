import { WarningMessage } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { useTranslation } from 'react-i18next';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { useState } from 'react';

type CardWithAccordionProps = {
  data: WarningMessage;
};

export const CardWithAccordion = ({ data }: CardWithAccordionProps) => {
  const { t } = useTranslation();
  const color = data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? 'text-error-700' : 'text-warning-500';
  const colorBg = data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? 'bg-red-600' : 'bg-acc6-600';
  const colorBorder = data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? 'border-red-600' : 'bg-acc6-600';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`h-${isOpen ? 10 : 6} m-2 overflow-hidden rounded border-s-4 border-solid border-transparent p-2 shadow-2 transition-height duration-500 ease-in-out hover:${colorBorder} hover:${colorBg} bg-opacity-30`}
    >
      <div className="flex w-full items-center justify-stretch gap-2">
        <StdIcon
          name={data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? StdIconId.Info : StdIconId.Warning}
          color={`${color}`}
        />
        <span
          className={`${color}`}
        >{`${data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? t('studyDetails.@import_status_error') : t('studyDetails.@import_status_warning')}`}</span>
        <div className="flex self-end">
          <button onClick={() => setIsOpen((prev) => !prev)}>
            <StdIcon name={isOpen ? StdIconId.KeyboardArrowUp : StdIconId.KeyboardArrowDown} />
          </button>
        </div>
      </div>
      {/*<div>{data.trajectory}</div>*/}
      <div className="my-1 text-wrap text-start">{data.content}</div>
    </div>
  );
};
