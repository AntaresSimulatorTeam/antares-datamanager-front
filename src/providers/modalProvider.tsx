/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ModalContext } from '@/contexts/modalContext';
import { PropsWithChildren, useCallback, useState } from 'react';

type ModalProviderProps = {
  defaultModalKey?: string;
};

const ModalProvider = ({ defaultModalKey, children }: PropsWithChildren<ModalProviderProps>) => {
  const [modalKey, setModalKey] = useState<string | undefined>(defaultModalKey);

  const closeModal = useCallback(() => setModalKey(undefined), [setModalKey]);

  const isOpen = useCallback((key: string) => key === modalKey, [modalKey]);

  return (
    <ModalContext.Provider value={{ currentModalKey: modalKey, closeModal, openModal: setModalKey, isOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
