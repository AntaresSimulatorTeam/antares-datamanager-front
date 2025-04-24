import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';
import { RdsIcon, RdsIconId, RdsTextTooltip } from 'rte-design-system-react';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ButtonColor, ButtonWithStdIcon } from '@/components/button/ButtonWithStdIcon.tsx';

export type CardDataType = {
  colorStatus: ButtonColor;
  color: string;
  colorBorder: string;
  icon: StdIconId;
  title: string;
  subtitle: string | null;
  content: string | null;
  generatedBy: string | null;
  generatedAt: Date | null;
};

type CardWithIconTitleProps = {
  data: CardDataType;
  size: string;
  transform: string;
  buttonLabel: string;
};

export const CardWithIconTitle = ({ data, size, transform, buttonLabel }: CardWithIconTitleProps) => (
  <div
    style={{ width: size, transform }}
    className={`absolute left-0 flex h-full flex-col items-stretch justify-start gap-0.5 rounded-lg border-b-4 border-transparent bg-gray-100 shadow-2 ${data.colorBorder} p-2`}
  >
    <div className="flex items-center justify-between gap-1">
      <div className="flex items-center justify-between gap-1">
        <StdIcon name={data.icon} color={`${data.color}`} />
        <span className={`${data.color} text-body-s`}>{data.title}</span>
      </div>
      <div className="flex">
        <ButtonWithStdIcon
          label={buttonLabel}
          icon={StdIconId.KeyboardArrowRight}
          position="left"
          size="extraSmall"
          color={data.colorStatus}
        />
      </div>
    </div>
    {data?.subtitle && (
      <div className="flex justify-start">
        <RdsTextTooltip text={data?.subtitle ?? ''} offset={5} placement="top">
          <span className="line-clamp-1 text-body-s">{data.subtitle}</span>
        </RdsTextTooltip>
      </div>
    )}
    {data?.content && (
      <div className="flex h-full justify-start text-gray-600">
        <RdsTextTooltip text={data?.content} offset={5} placement="top">
          <div className="line-clamp-2 text-start text-body-s">{data.content}</div>
        </RdsTextTooltip>
      </div>
    )}
    <div className="flex flex-col justify-end">
      <div className="flex gap-2 text-gray-600">
        <div className="flex items-center gap-1">
          <RdsIcon name={RdsIconId.Person} />
          {data?.generatedBy && <span className="text-body-s">{data.generatedBy}</span>}
        </div>
        {'|'}
        <div className="flex items-center gap-1">
          <RdsIcon name={RdsIconId.History} />
          {data?.generatedAt && <span className="text-body-s">{formatDateToDDMMYYYY(data.generatedAt)}</span>}
        </div>
      </div>
    </div>
  </div>
);
