/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const randomMinMax = (min: number, max: number) => min + Math.floor(Math.random() * (max - min)) + 1;
export const randomNumber = (max: number) => randomMinMax(0, max);
