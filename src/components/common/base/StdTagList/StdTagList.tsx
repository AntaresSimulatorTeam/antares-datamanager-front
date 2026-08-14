import { useCountMaxTagsToFitInContainer } from '@/components/common/base/StdTagList/tagListUtils';
import { useStdId } from '@/hooks/useStdId';
import clsx from 'clsx';
import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tagListClassBuilder } from './tagListClassBuilder';
import { Button, Dropdown, Icon, Tag, Tooltip } from '@design-system-rte/react';

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
        <Tooltip label={tooltipText ?? t('components.tags.@tags')}>
          <Icon name={icon} size={ICON_SIZE} color="#3b434a" />
        </Tooltip>
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
            <Tag label={tags[idx]} tagType="decorative" color="neutral" compactSpacing={true} />
          </span>
        ))}
        {plusTagsVisible && (
            <Dropdown
              dropdownId="card-options"
              onClose={() => setIsModalOpen(false)}
              style={{width: '200px'}}
              trigger={
                <Button
                  color="primary"
                  variant="primary"
                  size="s"
                  label={`+ ${isReady ? tags.length - (tagsNumber ?? 0) : '00'}`}
                  id={`${id}-popover-trigger`}
                  onClick={(e   ) => {
                    setIsModalOpen(true);
                    e.stopPropagation();
                  }}
                />
              }
              isOpen={isModalOpen}
            >
              <div className="flex flex-col p-1 gap-2">
                <div className="flex gap-1">
                  {tags?.slice(tagsNumber).map((tag: string | undefined) => (
                    <Tag
                      label={tag}
                      key={tag?.toLowerCase()}
                      tagType="decorative"
                      color="neutral"
                      compactSpacing={true}
                    />
                  ))}
                </div>
                <div className="flex">
                  <Button
                    label={t('components.popover.@close')}
                    size="s"
                    variant="primary"
                    onClick={(e) => {
                      setIsModalOpen(false);
                      e.stopPropagation();
                    }}
                    id={`${id}-popover-close`}
                  />
                </div>
              </div>
            </Dropdown>
        )}
      </div>
    </div>
  );
};

export default memo(StdTagList);
