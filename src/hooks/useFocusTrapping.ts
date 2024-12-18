/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';

const FOCUSABLE_ELEMENTS = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'details',
  '[tabindex]:not([tabindex="-1"])',
];
const FOCUSABLE_ELEMENTS_QUERY = FOCUSABLE_ELEMENTS.map((elmt) => elmt + ':not([disabled]):not([aria-hidden])').join(
  ',',
);

const getFocusableElements = (containerElement: HTMLElement) => {
  const elmts = containerElement.querySelectorAll(FOCUSABLE_ELEMENTS_QUERY) as unknown as HTMLElement[];
  return [elmts[0], elmts[elmts.length - 1]];
};

const useFocusTrapping = <TElement extends HTMLElement>(ref: React.RefObject<TElement | null>, show: boolean) => {
  useEffect(() => {
    if (!show || !ref.current) {
      return;
    }
    const containerElement = ref.current;

    const handleTabKeyPress = (event: KeyboardEvent) => {
      const [firstElement, lastElement] = getFocusableElements(containerElement);
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKeyPress);

    return () => {
      containerElement.removeEventListener('keydown', handleTabKeyPress);
    };
  }, [ref, show]);
};

export default useFocusTrapping;
