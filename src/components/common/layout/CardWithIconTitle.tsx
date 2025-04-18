import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';
import { RdsButton, RdsIconId, RdsTextTooltip } from 'rte-design-system-react';

export type CardDataType = {
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
    className={`absolute left-0 grid h-full rounded-lg bg-gray-100 shadow-2 ${data.colorBorder} p-2`}
  >
    <div className="flex items-center justify-between gap-1">
      <div className="flex justify-between gap-1">
        <StdIcon name={data.icon} color={`${data.color}`} />
        <span className={`${data.color} text-body-s sm:text-body-s`}>{data.title}</span>
      </div>
      <div className="flex">
        <RdsButton label={buttonLabel} icon={RdsIconId.KeyboardArrowRight} size={'extraSmall'} variant={'outlined'} />
      </div>
    </div>
    <div className="mt-1 flex">
      {data?.subtitle && <span className="text-body-s sm:text-body-s">{data.subtitle}</span>}
    </div>
    <div className="body-l sm:body-m my-1 line-clamp-2 self-stretch text-start text-gray-600">
      {data?.content && (
        <RdsTextTooltip text={data?.content ?? ''} offset={5} placement="top">
          <span className="flex text-body-s">{data.content}</span>
        </RdsTextTooltip>
      )}
    </div>
    <div className="flex gap-2 text-gray-600">
      <div className="body-l sm:body-m flex items-center gap-1">
        <StdIcon name={StdIconId.Person} />
        {data?.generatedBy && <span className="text-body-s sm:text-body-s">{data.generatedBy}</span>}
      </div>
      {'|'}
      <div className="body-l sm:body-m flex items-center gap-1">
        <StdIcon name={StdIconId.History} />
        {data?.generatedAt && (
          <span className="text-body-s sm:text-body-s">{formatDateToDDMMYYYY(data.generatedAt)}</span>
        )}
      </div>
    </div>
  </div>
);
