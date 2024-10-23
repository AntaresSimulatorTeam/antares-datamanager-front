/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { APP_LOGO_ID } from '@/shared/constants';
import { classMerger } from '@/shared/utils/common/classes/classMerger';
import { Link } from 'react-router-dom';

type StdNavbarHeaderProps = {
  id: string;
  appName: string;
  version: string;
  target: string;
  expanded?: boolean;
};

const WRAPPER_COMMON_CLASSES = 'p-1 rounded flex items-center gap-1 w-24 py-2';
const WRAPPER_BG_CLASSES = 'hover:bg-gray-200 dark:hover:bg-gray-700';
const WRAPPER_FOCUS_CLASSES =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-900 dark:focus-visible:outline-gray-w ';

const StdNavbarHeader = ({ appName, version, id, target, expanded = true }: StdNavbarHeaderProps) => (
  <Link to={target} className={classMerger(WRAPPER_COMMON_CLASSES, WRAPPER_BG_CLASSES, WRAPPER_FOCUS_CLASSES)} id={id}>
    <div className="h-[34px] py-0.25">
      <img src="/brand/appIcon.svg" id={APP_LOGO_ID} alt={appName} height={34} className="dark:hidden" />
      <img src="/brand/appIconDark.svg" id={APP_LOGO_ID} alt={appName} height={34} className="hidden dark:block" />
    </div>
    {expanded && (
      <>
        <div className="text-heading-xs font-semibold text-gray-900 dark:text-gray-100">
          <img src="/brand/antaresDark.svg" id={APP_LOGO_ID} alt={appName} height={34} className="hidden dark:block" />
          <img src="/brand/pegaseDark.svg" id={APP_LOGO_ID} alt={appName} height={34} className="hidden dark:block" />
          <img src="/brand/antares.svg" id={APP_LOGO_ID} alt={appName} height={34} className="dark:hidden" />
          <img src="/brand/pegase.svg" id={APP_LOGO_ID} alt={appName} height={34} className="dark:hidden" />
        </div>
        <div className="text-heading-xs text-gray-600">{version}</div>
      </>
    )}
  </Link>
);

export default StdNavbarHeader;
