import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';
import { RdsIcon, RdsIconId, RdsTextTooltip } from 'rte-design-system-react';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ButtonWithStdIcon } from '@/components/button/ButtonWithStdIcon.tsx';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { CardDataType } from '@/shared/types';

interface CardWithIconTitleProps {
  data: CardDataType;
  size: string;
  transform: string;
  buttonLabel: string;
}

export const CardWithIconTitle = ({ data, size, transform, buttonLabel }: CardWithIconTitleProps) => {
  const dispatch = useStudyDispatch();

  return (
    <div
      style={{ width: size, transform }}
      className={`absolute left-0 flex h-full flex-col justify-start gap-1 rounded-lg border-b-4 bg-gray-100 shadow-2 ${!data.isAck ? 'border-transparent' : 'border-b-gray-600'} ${!data.isAck ? data.colorBorder : 'hover:border-b-gray-600'} p-2`}
    >
      <div className="flex items-start justify-between gap-1">
        <RdsTextTooltip text={data.title} offset={5} placement="top">
          <div className="line-clamp-1 text-ellipsis break-all text-start text-body-s">{data.title}</div>
        </RdsTextTooltip>
        <div className="flex">
          <ButtonWithStdIcon
            label={buttonLabel}
            icon={StdIconId.KeyboardArrowRight}
            position="left"
            size="extraSmall"
            color={data.colorStatus}
            variant="outlined"
            disabled={data.isAck}
            onClick={() => {
              if (data.id != null && data.onClickItem && dispatch) {
                void data.onClickItem(data.id, data.trajectoryType, data.trajectoryId, dispatch);
              }
            }}
          />
        </div>
      </div>
      {data?.content && (
        <div className="flex h-full text-ellipsis text-gray-600">
          <RdsTextTooltip text={data?.content} offset={5} placement="top">
            <div className="line-clamp-2 text-ellipsis text-start text-body-xs">{data.content}</div>
          </RdsTextTooltip>
        </div>
      )}
      <div className="flex flex-col justify-end">
        <div className="flex gap-2 text-gray-600">
          <div className="flex items-center gap-1">
            <RdsIcon name={RdsIconId.Person} />
            {data?.generatedBy && <span className="text-body-xs">{data.generatedBy}</span>}
          </div>
          {'|'}
          <div className="flex items-center gap-1">
            <RdsIcon name={RdsIconId.History} />
            {data?.generatedAt && <span className="text-body-xs">{formatDateToDDMMYYYY(data.generatedAt)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
