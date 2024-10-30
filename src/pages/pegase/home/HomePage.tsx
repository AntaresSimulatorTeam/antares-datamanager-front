/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Header from '@/pages/pegase/home/header/Header';
import StudyTable from './components/StudyTable';

const HomePage = () => (
  <>
    <div className="flex flex-auto flex-col items-center gap-6 p-3">
      <Header />
      <StudyTable />
    </div>
  </>
);

export default HomePage;
