/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren } from 'react';
import cardClassBuilder from './cardClassBuilder';
import PegaseCardTitle, { PegaseCardTitleProps } from './pegaseCardTitle/pegaseCardTitle';
import { RdsButton, RdsButtonProps, RdsCard, RdsCardProps } from 'rte-design-system-react';

export type PegaseCardSecondaryButtonPosition = 'default' | 'center';

export type PegaseCardTripleActionButtonProps = {
  primary?: Omit<RdsButtonProps, 'type' | 'size' | 'variant'>;
  secondary?: Omit<RdsButtonProps, 'type' | 'size' | 'variant'>;
};

type PegaseCardTripleActionProps = Omit<RdsCardProps, 'disabled'> &
  PegaseCardTitleProps & {
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
    <RdsCard id={id} onClick={buttons ? undefined : onClick}>
      <div className="flex h-full w-full cursor-pointer flex-col gap-2 p-2">
        <PegaseCardTitle
          id={`${id}-title`}
          title={title}
          onClick={() => (onClick ? onClick() : undefined)}
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
                <RdsButton
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
                <RdsButton id={id && `${id}-primary-button`} size="small" {...buttons.primary} />
              </div>
            )}
          </div>
        )}
      </div>
    </RdsCard>
  );
};

export default PegaseCard;
