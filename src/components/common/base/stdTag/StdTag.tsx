/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { tagClassBuilder } from './tagClassBuilder';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIconButton from '../stdIconButton/StdIconButton';

export type StdTagProps = {
  id?: string;
  label: string;
  onDelete?: () => void;
};

const StdTag = ({ id: propsId, label, onDelete }: StdTagProps) => {
  const tagClasses = tagClassBuilder(!!onDelete);
  const id = useStdId('tag', propsId);

  return (
    <span className={tagClasses} id={id} role="listitem">
      <label className="overflow-hidden text-ellipsis whitespace-nowrap whitespace-pre text-overnote">{label}</label>
      {onDelete && (
        <span className="px-0.25">
          <StdIconButton icon={StdIconId.Close} onClick={onDelete} size="extraSmall" variant="danger" />
        </span>
      )}
    </span>
  );
};

export default StdTag;
