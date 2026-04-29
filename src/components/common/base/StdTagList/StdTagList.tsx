import { useCountMaxTagsToFitInContainer } from '@/components/common/base/StdTagList/tagListUtils';
import { useStdId } from '@/hooks/useStdId';
import { stopPropagationAndPreventDefault } from '@/shared/utils/event/stopPropagation';
import clsx from 'clsx';
import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StdPopover from '../../layout/stdPopover/StdPopover';
import StdTextTooltip from '../../layout/stdTextTooltip/StdTextTooltip';
import { tagListClassBuilder } from './tagListClassBuilder';
import { Button, Icon } from '@design-system-rte/react';
import StdTag from '@common/base/stdTag/StdTag.tsx';

type StdTagListProps = {
  tags: string[];
  icon?: string;
  tooltipText?: string;
  id?: string;
  autoExpands?: boolean;
  singleLine?: boolean;
  maxVisibleTags?: number;
  startReady?: boolean;
};

const TAG_LIST_CLASSES = 'flex h-full w-full items-center gap-1';

const ICON_SIZE = 16;
const POPOVER_OFFSET = 10;

const StdTagList = ({
  tags,
  icon,
  tooltipText,
  id: propsId,
  autoExpands = false,
  singleLine = false,
  maxVisibleTags,
  startReady = false,
}: StdTagListProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const plusTagRef = useRef<HTMLSpanElement>(null);
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const id = useStdId('tag-list', propsId);

  const { tagsNumber, isReady } = useCountMaxTagsToFitInContainer({
    containerRef,
    tagsRef,
    plusTagRef,
    autoExpands,
    singleLine,
    maxVisibleTags,
    tags,
    startReady,
  });
  const { tagListClasses } = tagListClassBuilder(isReady, singleLine);

  const plusTagsVisible = tags.length > (tagsNumber ?? 0);

  return (
    <div id={id} className={clsx(TAG_LIST_CLASSES, { 'items-center': singleLine })}>
      {icon && (
        <StdTextTooltip text={tooltipText ?? t('components.tags.@tags')}>
          <Icon name={icon} size={ICON_SIZE} color="#3b434a" />
        </StdTextTooltip>
      )}
      <div className={tagListClasses} ref={containerRef} role="list">
        {tags.map((tag, idx) => (
          <span
            ref={(r) => {
              tagsRef.current[idx] = r;
            }}
            className={idx >= (tagsNumber ?? 0) ? 'hidden' : ''}
            key={tag.toLowerCase()}
          >
            <StdTag label={tags[idx]} />
          </span>
        ))}
        {plusTagsVisible && (
          <span
            onKeyDown={stopPropagationAndPreventDefault}
            className="flex h-2.25 items-center"
            ref={plusTagRef}
            onClick={stopPropagationAndPreventDefault}
          >
            <StdPopover
              offset={POPOVER_OFFSET}
              show={showPopover}
              setShow={setShowPopover}
              placement="bottom"
              id={`${id}-popover`}
            >
              <StdPopover.Trigger>
                <Button
                  color="primary"
                  variant="primary"
                  size="s"
                  label={`+ ${isReady ? tags.length - (tagsNumber ?? 0) : '00'}`}
                  id={`${id}-popover-trigger`}
                />
              </StdPopover.Trigger>
              <StdPopover.Content>
                <div className="flex max-w-32 flex-wrap gap-x-0.5 gap-y-1">
                  {tags.slice(tagsNumber).map((tag) => (
                    <StdTag label={tag} key={tag.toLowerCase()} />
                  ))}
                </div>
              </StdPopover.Content>
              <StdPopover.Footer>
                <Button
                  label={t('components.popover.@close')}
                  size="s"
                  variant="primary"
                  onClick={() => setShowPopover(false)}
                  id={`${id}-popover-close`}
                />
              </StdPopover.Footer>
            </StdPopover>
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(StdTagList);
