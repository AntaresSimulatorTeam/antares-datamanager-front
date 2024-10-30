/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ProjectCreator from './ProjectCreator';
import CardHeader from './CardHeader';

const cards = ['card1', 'card2', 'card3'];
const Header = () => (
  <>
    <div className="flex h-18 w-full gap-3">
      <ProjectCreator />
      {cards.map((card) => (
        <CardHeader key={card} label={card} />
      ))}
    </div>
    <div className="grid w-full grid-cols-3 gap-3">
      {cards.map((card) => (
        <CardHeader key={card} label={card} />
      ))}
      {cards.map((card) => (
        <CardHeader key={card} label={card} />
      ))}
      {cards.map((card) => (
        <CardHeader key={card} label={card} />
      ))}
      {cards.map((card) => (
        <CardHeader key={card} label={card} />
      ))}
      {cards.map((card) => (
        <CardHeader key={card} label={card} />
      ))}
    </div>
  </>
);

export default Header;
