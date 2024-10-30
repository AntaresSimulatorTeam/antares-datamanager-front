/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PinnedProjectCards from '@/pages/pegase/home/header/PinnedProjectCard';
import ProjectCreator from '@/pages/pegase/home/header/ProjectCreator';

const Header = () => {
  return (
    <>
      <div className="flex h-18 w-full gap-3">
        <ProjectCreator />
        <PinnedProjectCards />
      </div>
    </>
  );
};

export default Header;
