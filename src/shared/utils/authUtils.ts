import { User } from 'oidc-client-ts';

type ProfileWithRole = User & {
  profile: {
    realm_access: {
      roles: string[];
    };
  };
};

export const hasUserRole = (role: string, user: ProfileWithRole): boolean =>
  user?.profile.realm_access.roles?.includes(role);
