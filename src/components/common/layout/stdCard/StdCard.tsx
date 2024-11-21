/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStdId } from '@/hooks/common/useStdId';
import { tabIndex } from '@/shared/utils/tabIndexUtils';
import { PropsWithChildren, useRef, useState } from 'react';
import cardClassBuilder from './cardClassBuilder';

export type StdCardProps = {
  id?: string;
  disabled?: boolean;
  onClick?: () => void;
};

const SPACEBAR_INPUT = ' ';

export default function StdCard({ id: propsId, children, disabled, onClick }: PropsWithChildren<StdCardProps>) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const { cardClasses } = cardClassBuilder(!!onClick, isActive, disabled);
  const id = useStdId('card', propsId);

  const handleKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && e.key === SPACEBAR_INPUT && (e.target as HTMLElement) === cardRef.current) {
      e.preventDefault();
      setIsActive(true);
    }
  };

  const handleKeyup = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && e.key === SPACEBAR_INPUT && (e.target as HTMLElement) === cardRef.current) {
      onClick();
      setIsActive(false);
    }
  };

  const handleBlur = () => {
    setIsActive(false);
  };

  return (
    <div
      id={id}
      tabIndex={tabIndex(!!onClick)}
      className={cardClasses}
      onKeyDown={handleKeydown}
      onKeyUp={handleKeyup}
      onBlur={handleBlur}
      onClick={onClick}
      ref={cardRef}
      role="region"
    >
      {children}
    </div>
  );
}
