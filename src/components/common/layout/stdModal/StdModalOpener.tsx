/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ModalContext } from '@/contexts/modalContext';
import { PropsWithChildren, useContext } from 'react';

type StdModalOpenerProps = PropsWithChildren<{
  modalKey: string;
}>;

const StdModalOpener = ({ modalKey, children }: StdModalOpenerProps) => {
  const modalContext = useContext(ModalContext);

  const showModal = modalContext.currentModalKey === modalKey;
  if (!showModal) return null;
  return children;
};

export default StdModalOpener;
