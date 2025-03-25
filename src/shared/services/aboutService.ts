import { AuthService } from '@/shared/services/authService.ts';
import {AppInfo} from "@/shared/types/AppInfo";
import {ACTUATOR_ENDPOINT} from "@/shared/const/apiEndPoint";

export const fetchAppInfo = async (): Promise<AppInfo> => {
  const apiUrl = `${ACTUATOR_ENDPOINT}`;
  const response = await AuthService.authFetch(apiUrl);
  if (!response.ok) {
    throw new Error('Error fetching app info');
  }
  const data = await response.json();
  return {
    appName: data.app.name,
    appDescription: data.app.description,
    appVersion: data.app.version,
    appBranch: data.git.branch,
    commitId: data.git.commit.id,
    time: data.git.commit.time,
  };
};