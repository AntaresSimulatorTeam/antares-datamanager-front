/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

function generateList(): string[] {
  const words1 = ['Bilan', 'Future'];
  const words2 = ['énergétique', 'prévisionnelle'];
  const years = Array.from({ length: 26 }, (_, index) => 2025 + index);

  const list: string[] = [];

  for (let i = 0; i < 20; i++) {
    const word1 = words1[Math.floor(Math.random() * words1.length)];
    const word2 = words2[Math.floor(Math.random() * words2.length)];
    const year = years[Math.floor(Math.random() * years.length)];

    const item = `${word1} ${word2} ${year}`;
    list.push(item);
  }

  return list;
}

const myList = generateList();
console.log(myList);
