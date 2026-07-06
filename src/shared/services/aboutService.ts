import { AppBackendInfos, AppInfo } from '@/shared/types/AppInfo';
import { BACK_END_ACTUATOR_ENDPOINT, GENERATOR_ACTUATOR_ENDPOINT } from '@/shared/const/apiEndPoint';
import packageJson from '../../../package.json';
import { GIT_INFO } from '@/gitInfo.ts';
import { Entries } from '@/shared/types/Generic.type.ts';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';

export const fetchBackendInfo = async (): Promise<AppInfo> => {
  const apiUrl = `${BACK_END_ACTUATOR_ENDPOINT}`;
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

export const fetchGeneratorBackendInfo = async (): Promise<AppInfo> => {
  const apiUrl = `${GENERATOR_ACTUATOR_ENDPOINT}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Error fetching generator app info');
  }

  return response.json();
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

    const backEndData = await fetchBackendInfo();
    // fetch generator info but don't fail if unavailable
    let generatorData: Partial<AppInfo> = {};
    try {
      generatorData = await fetchGeneratorBackendInfo();
    } catch (e) {
      // ignore generator fetch errors
    }

    return (Object.entries(backEndData) as Entries<typeof backEndData>)?.map(([key, value]) => ({
      info: key,
      front: frontInfos[key],
      back: value,
      generator: (generatorData as any)[key] ?? key,
    }));
  } catch (error) {
    throw new Error((error as Error)?.message ?? '');
  }
};
