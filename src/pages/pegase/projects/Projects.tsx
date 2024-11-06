/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PegaseHeader from './components/PegaseHeader';
import ProjectPageContent from './components/ProjectPageContent';

export const Projects = () => (
  <div className="flex flex-col">
    <PegaseHeader />
    <ProjectPageContent />
  </div>
);

export default Projects;
