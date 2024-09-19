/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const getDimensions = (el: HTMLElement) => {
  const elStyle = window.getComputedStyle(el);
  const elDisplay = elStyle.display;
  const elMaxHeight = elStyle.maxHeight.replace('px', '').replace('%', '');

  // if its not hidden we just return normal height
  if (elDisplay !== 'none' && elMaxHeight !== '0') {
    return { height: el.offsetHeight, width: el.offsetWidth };
  }

  // the element is hidden so:
  // making the el block so we can meassure its height but still be hidden
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.display = 'block';

  const wantedHeight = { height: el.offsetHeight, width: el.offsetWidth };

  // reverting to the original values
  el.style.display = '';
  el.style.position = '';
  el.style.visibility = '';

  return wantedHeight;
};
