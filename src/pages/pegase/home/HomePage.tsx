/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Header from '@/components/pegase/header/Header';
import StudyTable from './components/StudyTable';

const HomePage = () => (
  <>
    <div className="p- inline-flex h-[800px] flex-col items-start justify-start gap-6">
      <Header />
      <StudyTable />
    </div>
  </>
);

export default HomePage;
