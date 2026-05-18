export interface AppBackendInfos {
  app: {
    name: string;
    description: string;
    version: string;
  };
  git: {
    branch: string;
    commit: {
      id: string;
      time: string;
    };
  };
  build: {
    time: string;
  };
}

export interface AppInfo {
  appName: string;
  appDescription: string;
  appVersion: string;
  appBranch: string;
  commitId: string;
  commitTime: string;
}

export interface AppData {
  info: string;
  front: string;
  back: string;
  generator?: string;
}
