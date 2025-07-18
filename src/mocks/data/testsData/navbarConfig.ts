import { HeaderStyleLogoConfig, HeaderStyleTextConfig } from '@/components/common/layout/stdNavbar/StdNavbar';

export const TEST_TEXT_HEADER_CONFIG: HeaderStyleTextConfig = {
  variant: 'text',
  appTwoLetters: 'IG',
  appVersion: 'v3.0',
  appName: 'Imagrid',
  versionTextColor: 'gray-600',
};

export const TEST_LOGO_HEADER_CONFIG: HeaderStyleLogoConfig = {
  variant: 'logo',
  appName: 'Imagrid',
  appVersion: 'v3.0',
  versionTextColor: 'gray-600',
  logoConfig: {
    logoCollapsedHref: '/logo-collapsed.svg',
    logoExpandedHref: '/logo-expanded.svg',
  },
};
