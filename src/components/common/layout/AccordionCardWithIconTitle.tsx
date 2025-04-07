import { WarningMessage } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { useTranslation } from 'react-i18next';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { useState } from 'react';

type AccordionCardWithIconTitleProps = {
  data: WarningMessage;
};

export const AccordionCardWithIconTitle = ({ data }: AccordionCardWithIconTitleProps) => {
  const { t } = useTranslation();
  const color = data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? 'error-700' : 'text-warning-500';
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col items-start rounded transition-[height] delay-150 duration-300 ease-in-out">
      <div className="flex w-full items-center gap-2">
        <StdIcon
          name={data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? StdIconId.Info : StdIconId.Warning}
          color={`${color}`}
        />
        <span
          className={`${color}`}
        >{`${data.level === WARNING_MESSAGE_LEVEL.ERROR_LEVEL ? t('studyDetails.@import_status_error') : t('studyDetails.@import_status_warning')}`}</span>
        <div className="flex self-end">
          <button onClick={() => setIsCollapsed((prev) => !prev)}>
            <StdIcon name={StdIconId.KeyboardArrowRight} />
          </button>
        </div>
      </div>
      {/*<div>{data.trajectory}</div>*/}
      {isCollapsed && <div className="text-start">{data.content}</div>}
    </div>
  );
};
