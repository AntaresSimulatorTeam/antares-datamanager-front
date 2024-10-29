/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { KeyboardEvent, useRef, useState } from 'react';

export const SPACEBAR_INPUT = 'Space';

type OptionsActiveKeyboard = {
  id?: string;
  interactiveKeyCodes?: string[];
};

const useActiveKeyboard = <T extends HTMLElement>(
  handlerKeyup: (e: KeyboardEvent<T>) => void,
  options: OptionsActiveKeyboard = {},
) => {
  const { id, interactiveKeyCodes } = options;
  const [isActiveKeyboard, setIsActiveKeyboard] = useState<boolean>(false);
  const interactiveKeysRef = useRef<string[]>(interactiveKeyCodes ?? [SPACEBAR_INPUT]);

  const onKeyDown = (e: React.KeyboardEvent<T>) => {
    if (interactiveKeysRef.current?.includes(e.code) && (!id || (e.target as T).id === id)) {
      e.preventDefault();
      setIsActiveKeyboard(true);
    }
  };

  const onKeyUp = (e: React.KeyboardEvent<T>) => {
    if (interactiveKeysRef.current?.includes(e.code) && (!id || (e.target as T).id === id)) {
      handlerKeyup(e);
      setIsActiveKeyboard(false);
    }
  };

  const onBlur = () => {
    setIsActiveKeyboard(false);
  };

  return [{ onKeyDown, onKeyUp, onBlur }, isActiveKeyboard] as [
    {
      onKeyDown: (e: React.KeyboardEvent<T>) => void;
      onKeyUp: (e: React.KeyboardEvent<T>) => void;
      onBlur: () => void;
    },
    boolean,
  ];
};

export default useActiveKeyboard;
