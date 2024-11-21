/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdButton, { StdButtonProps } from '@/components/common/base/stdButton/StdButton';
import StdCard, { StdCardProps } from '@/components/common/layout/stdCard/StdCard';
import { PropsWithChildren } from 'react';
import cardClassBuilder from './cardClassBuilder';
import PegaseCardTitle, { PegaseCardTitleProps } from './pegaseCardTitle/pegaseCardTitle';

export type PegaseCardSecondaryButtonPosition = 'default' | 'center';

export type PegaseCardTripleActionButtonProps = {
  primary?: Omit<StdButtonProps, 'type' | 'size' | 'variant'>;
  secondary?: Omit<StdButtonProps, 'type' | 'size' | 'variant'>;
};

type PegaseCardTripleActionProps = Omit<StdCardProps, 'disabled'> &
  Omit<PegaseCardTitleProps, 'onClick'> & {
    title: string;
    buttons?: PegaseCardTripleActionButtonProps;
    secondaryButtonPosition?: PegaseCardSecondaryButtonPosition;
  };

const PegaseCard = ({
  id,
  onClick,
  title,
  icons,
  tag,
  buttons,
  secondaryButtonPosition,
  lineClamp,
  dropdownOptions,
  children,
}: PropsWithChildren<PegaseCardTripleActionProps>) => {
  const { buttonContainerClasses, primaryButtonContainerClasses, secondaryButtonContainerClasses } =
    cardClassBuilder(secondaryButtonPosition);
  return (
    <StdCard id={id} onClick={buttons ? undefined : onClick}>
      <div className="flex h-full w-full flex-col gap-2 p-2">
        <PegaseCardTitle
          id={`${id}-title`}
          title={title}
          onClick={buttons ? onClick : undefined}
          icons={icons}
          lineClamp={lineClamp}
          dropdownOptions={dropdownOptions}
          tag={tag}
        />
        <div className="flex grow">{children}</div>
        {buttons && (
          <div className={buttonContainerClasses}>
            {buttons.secondary && (
              <div className={secondaryButtonContainerClasses}>
                <StdButton
                  id={id && `${id}-secondary-button`}
                  size="small"
                  color="secondary"
                  variant="text"
                  {...buttons.secondary}
                />
              </div>
            )}
            {buttons.primary && (
              <div className={primaryButtonContainerClasses}>
                <StdButton id={id && `${id}-primary-button`} size="small" {...buttons.primary} />
              </div>
            )}
          </div>
        )}
      </div>
    </StdCard>
  );
};

export default PegaseCard;
