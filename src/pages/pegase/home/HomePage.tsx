/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import HomePageContent from './components/HomePageContent';
import PinnedProject from '@/pages/pegase/home/pinnedProjects/PinnedProject';
import { useState } from 'react';

const HomePage = () => {
  const [reloadPinnedProject, isReloadPinnedProject] = useState<boolean>(true);

  return (
    <>
      <div className="flex flex-col items-center gap-6 p-3">
        <PinnedProject reloadPinnedProject={reloadPinnedProject} isReloadPinnedProject={isReloadPinnedProject} />
        <HomePageContent />
      </div>
    </>
  );
};

export default HomePage;
