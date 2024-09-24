/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StdTextTooltip from '../../layout/stdTextTooltip/StdTextTooltip';
import StdButton from '../stdButton/StdButton';
import StdIcon from '../stdIcon/StdIcon';
import StdTag from '../stdTag/StdTag';
import { tagListClassBuilder } from './tagListClassBuilder';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useStdId } from '@/hooks/common/useStdId';
import StdPopover from '../../layout/stdPopover/StdPopover';
import { useCallOnResize } from '@/hooks/common/useCallOnResize';
import { countMaxItemsToFitInContainer } from '@/shared/utils/common/displayUtils';

type StdTagListProps = {
  tags: string[];
  icon?: StdIconId;
  tooltipText?: string;
  onDelete?: (tag: string) => void;
  id?: string;
  autoExpends?: boolean;
};

const ICON_SIZE = 16;
const POPOVER_OFFSET = 10;

const StdTagList = ({ tags, icon, tooltipText, id: propsId, onDelete, autoExpends = false }: StdTagListProps) => {
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [tagsNumber, setTagsNumber] = useState<number>(tags.length);
  const { tagListClasses } = tagListClassBuilder(isReady);
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const id = useStdId('tag-list', propsId);

  useCallOnResize(() => setTagsNumber(countMaxItemsToFitInContainer(containerRef, tagsRef, autoExpends)), id);

  useEffect(() => {
    setTagsNumber(countMaxItemsToFitInContainer(containerRef, tagsRef, autoExpends));
    setIsReady(true);
  }, [tags, autoExpends]);

  return (
    <div id={id} className="flex h-full w-full gap-1">
      {icon && (
        <StdTextTooltip text={tooltipText ?? t('components.tags.@tags')}>
          <StdIcon name={icon} width={ICON_SIZE} height={ICON_SIZE} color="text-gray-700" />
        </StdTextTooltip>
      )}
      <div className={tagListClasses} ref={containerRef} role="list">
        {tags.map((tag, idx) => (
          <span
            ref={(r) => (tagsRef.current[idx] = r)}
            className={idx >= tagsNumber ? 'hidden' : ''}
            key={tag.toLowerCase()}
          >
            <StdTag label={tags[idx]} onDelete={onDelete ? () => onDelete(tag) : undefined} />
          </span>
        ))}
        <span className="flex">
          {(!isReady || tags.length - tagsNumber > 0) && (
            <StdPopover offset={POPOVER_OFFSET} show={showPopover} setShow={setShowPopover} id={`${id}-popover`}>
              <StdPopover.Trigger>
                <StdButton
                  color="secondary"
                  variant="outlined"
                  size="extraSmall"
                  label={`+ ${isReady ? tags.length - tagsNumber : '00000'}`}
                  id={`${id}-popover-trigger`}
                />
              </StdPopover.Trigger>
              <StdPopover.Content>
                <div className="flex max-w-32 flex-wrap gap-x-0.5 gap-y-1">
                  {tags.map((tag) => (
                    <StdTag label={tag} onDelete={onDelete ? () => onDelete(tag) : undefined} key={tag.toLowerCase()} />
                  ))}
                </div>
              </StdPopover.Content>
              <StdPopover.Footer>
                <StdButton
                  label={t('components.popover.@close')}
                  size="extraSmall"
                  onClick={() => setShowPopover(false)}
                  id={`${id}-popover-close`}
                />
              </StdPopover.Footer>
            </StdPopover>
          )}
        </span>
      </div>
    </div>
  );
};

export default StdTagList;
