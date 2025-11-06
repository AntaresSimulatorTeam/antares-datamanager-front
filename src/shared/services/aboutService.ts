import { AppBackendInfos, AppInfo } from '@/shared/types/AppInfo';
import { ACTUATOR_ENDPOINT } from '@/shared/const/apiEndPoint';
import packageJson from '../../../package.json';
import { GIT_INFO } from '@/gitInfo.ts';
import { Entries } from '@/shared/types/Generic.type.ts';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';

export const fetchBackendInfo = async (): Promise<AppInfo> => {
  const apiUrl = `${ACTUATOR_ENDPOINT}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Error fetching app info');
  }
  const { app, git } = (await response.json()) as AppBackendInfos;

  return {
    appName: app.name,
    appDescription: app.description,
    appVersion: app.version,
    appBranch: git?.branch,
    commitId: git?.commit.id,
    commitTime: git?.commit.time ? formatDateToDDMMYYYY(git?.commit.time, true) : new Date().toISOString(),
  };
};

export const fetchAppInfo = async () => {
  try {
    const frontInfos = {
      appName: packageJson.name,
      appDescription: packageJson.description,
      appVersion: packageJson.version,
      appBranch: GIT_INFO?.branch,
      commitId: GIT_INFO?.commit,
      commitTime: GIT_INFO?.commitTime ? formatDateToDDMMYYYY(GIT_INFO?.commitTime, true) : new Date().toISOString(),
    };

    const data = await fetchBackendInfo();
    return (Object.entries(data) as Entries<typeof data>)?.map(([key, value]) => ({
      info: key,
      front: frontInfos[key],
      back: value,
    }));
  } catch (error) {
    throw new Error((error as Error)?.message ?? '');
  }
};
