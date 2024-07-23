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

const WRAPPER_COMMON_CLASSES = 'm-1 mt-2 rounded flex items-center gap-1 p-1';
const WRAPPER_FOCUS_CLASSES =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-900';

const StdNavbarHeader = ({ appName, version, id, target, expanded = true }: StdNavbarHeaderProps) => (
  <Link to={target} className={classMerger(WRAPPER_COMMON_CLASSES, WRAPPER_FOCUS_CLASSES)} id={id}>
    <div className="h-[34px] py-0.25">
      <img src="/brand/app-icon.svg" id={APP_LOGO_ID} alt={appName} />
    </div>
    {expanded && (
      <>
        <div className="text-heading-xs font-semibold text-gray-900 dark:text-gray-100">{appName}</div>
        <div className="text-heading-xs text-gray-600">{version}</div>
      </>
    )}
  </Link>
);

export default StdNavbarHeader;
