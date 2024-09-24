/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef } from 'react';

export function useCallOnResize(callback: () => void, elementId?: string, debounceTime = 200) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(() => {
    callback();
  });

  const handleResize = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(callbackRef.current, debounceTime);
  }, [debounceTime]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (elementId) {
      const element = document.getElementById(elementId);
      element && resizeObserver.observe(element);
    } else {
      window.addEventListener('resize', handleResize);
    }
    handleResize();
    return () => {
      if (elementId) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [handleResize, elementId]);
}
