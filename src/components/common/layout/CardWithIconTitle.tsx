import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';
import { CardDataType } from '@/shared/types';
import { Button, Icon, Tooltip } from '@design-system-rte/react';
import { buildCardClass } from '@/shared/utils/tailwindClass.ts';

interface CardWithIconTitleProps {
  data: CardDataType;
  size: string;
  transform: string;
}

export const CardWithIconTitle = ({ data, size, transform }: CardWithIconTitleProps) => {
  const getButton = () => {
    if (data.isAck) {
      return (
        <Tooltip label={data.buttonTooltipText} position="left">
          {
            <Button
              label={data.buttonLabel}
              onClick={() => {
                if (data.id != null) {
                  void data.onClickItem?.(data.id);
                }
              }}
              variant="secondary"
              disabled={data.isAck}
              icon="arrow-chevron-right"
              iconAppearance="filled"
              size="s"
            />
          }
        </Tooltip>
      );
    } else {
      return (
        <Button
          label={data.buttonLabel}
          onClick={() => {
            if (data.id != null) {
              void data.onClickItem?.(data.id);
            }
          }}
          variant="secondary"
          disabled={data.isAck}
          icon="arrow-chevron-right"
          iconAppearance="filled"
          size="s"
          color={data.isAck ? '#3b434a' : '#bc3115'}
        />
      );
    }
  };

  return (
    <div
      style={{ width: size, transform }}
      className={buildCardClass(data)}
    >
      <div className="flex items-start justify-between gap-1">
        <Tooltip label={data.title} position="top">
          <div className="line-clamp-1 text-ellipsis break-all text-start text-body-s">{data.title}</div>
        </Tooltip>
        {data.onClickItem != null && getButton()}
      </div>
      {data?.content && (
        <div className="h-[calc(theme(lineHeight.4)*2)] overflow-hidden aspect-medium:h-[calc(theme(lineHeight.4)*2.2)] aspect-wide:h-[calc(theme(lineHeight.4)*2.4)]">
          <Tooltip label={data?.content} position="right">
            <div className="leading-2 line-clamp-2 text-ellipsis text-start text-body-s">{data.content}</div>
          </Tooltip>
        </div>
      )}
      <div className="flex flex-col justify-end">
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <Icon name="user" />
            {data?.generatedBy && <span className="text-body-s">{data.generatedBy}</span>}
          </div>
          {'|'}
          <div className="flex items-center gap-1">
            <Icon name="history" />
            {data?.generatedAt && <span className="text-body-s">{formatDateToDDMMYYYY(data.generatedAt, true)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
