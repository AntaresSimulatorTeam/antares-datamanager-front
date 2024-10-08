/* /*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import AreaTableDisplay from './AreaTableDisplay';
import TabSelection from './TabSelection';

const ContentPage = () => {
  return (
    <div className="flex w-full flex-col gap-3 overflow-auto p-9 text-left">
      <span>2069-2070</span>
      <TabSelection expanded={true} />
      <AreaTableDisplay />
    </div>
  );
};

export default ContentPage;
