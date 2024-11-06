/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PegaseCard from './PegaseCard';

export const ProjectCardsGrid = () => {
  const cards = ['card1', 'card2', 'card3', 'card1', 'card2', 'card3'];
  return (
    <div className="grid w-full grid-cols-3 gap-3">
      {cards.map((card) => (
        <PegaseCard key={card} />
      ))}
    </div>
  );
};

export default ProjectCardsGrid;
