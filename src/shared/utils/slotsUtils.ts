import React, { Children, FunctionComponent, ReactElement } from 'react';

export const findSlotOfType = <T>(
  children: ReactElement | ReactElement[] | undefined,
  slotType: FunctionComponent<T>,
): ReactElement | null =>
  Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === slotType,
  ) as ReactElement | null;
