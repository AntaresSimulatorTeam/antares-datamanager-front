import { getEnvVariables } from '@/envVariables';
import { vi } from 'vitest';
import { isAuthenticationActive } from '@/shared/utils/authUtils.ts';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(),
}));

describe('isAuthenticationActive', () => {
  it('should return false if IS_AUTHENTICATION_ACTIVE env variable is set to false', () => {
    vi.mocked(getEnvVariables).mockReturnValue('false');
    expect(isAuthenticationActive()).toBeFalsy();
  });
  it('should return true if IS_AUTHENTICATION_ACTIVE env variable is set to true', () => {
    vi.mocked(getEnvVariables).mockReturnValue('true');
    expect(isAuthenticationActive()).toBeTruthy();
  });
});
