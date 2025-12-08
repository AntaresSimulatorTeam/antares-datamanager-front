import { getDefaultAreas } from '@/shared/services/defaultConfigService.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { waitFor } from '@testing-library/react';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { vi } from 'vitest';
import { ThermalOptions } from '@/mocks/data/list/names.ts';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/authService');

describe('getDefaultAreas', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch default areas', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve({ name: 'FR' }),
    });

    const result = await getDefaultAreas();

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/default_config/load');
      expect(result).toEqual({ name: 'FR' });
    });
  });

  it('should throw error when data fetching failed', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch default hypothesis',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getDefaultAreas()).rejects.toThrowError('Failed to fetch default hypothesis');
  });
});

describe('getThermalTechnologyList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch thermal technology list', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(ThermalOptions),
    });

    const result = await getDefaultAreas();

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/default_config/load');
      expect(result).toEqual(ThermalOptions);
    });
  });

  it('should throw error when data fetching failed', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch thermal technology list',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getDefaultAreas()).rejects.toThrowError('Failed to fetch thermal technology list');
  });
});
