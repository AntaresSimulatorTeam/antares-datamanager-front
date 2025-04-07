import { AuthService } from '@/shared/services/authService.ts';
import { AppBackendInfos, AppInfo } from '@/shared/types/AppInfo';
import { ACTUATOR_ENDPOINT } from '@/shared/const/apiEndPoint';
import packageJson from '../../../package.json';
import { GIT_INFO } from '@/gitInfo.ts';
import { Entries } from '@/shared/types/Generic.type.ts';

export const fetchBackendInfo = async (): Promise<AppInfo> => {
  const apiUrl = `${ACTUATOR_ENDPOINT}`;
  const response = await AuthService.authFetch(apiUrl);
  if (!response.ok) {
    throw new Error('Error fetching app info');
  }
  const { app, git, build } = (await response.json()) as AppBackendInfos;

  return {
    appName: app.name,
    appDescription: app.description,
    appVersion: app.version,
    appBranch: git.branch,
    commitId: git.commit.id,
    buildTime: build.time,
  };
};

export const fetchAppInfo = async () => {
  try {
    const frontInfos = {
      appName: packageJson.name,
      appDescription: packageJson.description,
      appVersion: packageJson.version,
      appBranch: GIT_INFO.branch,
      commitId: GIT_INFO.commit,
      buildTime: GIT_INFO.buildTime,
    };

    const data = await fetchBackendInfo();
    return (Object.entries(data) as Entries<typeof data>).map(([key, value]) => ({
      info: key,
      front: frontInfos[key],
      back: value,
    }));
  } catch (error) {
    throw new Error((error as Error)?.message ?? '');
  }
};
