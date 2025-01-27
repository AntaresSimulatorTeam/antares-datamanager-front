/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext } from 'react';

type ModalContextType = {
  openModal: (modalKey: string) => void;
  closeModal: () => void;
  isOpen: (modalKey: string) => boolean;
  currentModalKey?: string;
};

export const ModalContext = createContext<ModalContextType>({
  openModal: (_modalKey: string) => {},
  closeModal: () => {},
  isOpen: (_modalKey: string) => false,
});
