import { vi } from 'vitest';
import { AuthService } from '@/shared/services/authService.ts';
import { waitFor } from '@testing-library/react';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { fetchWarningMessagesFromType, skipMessage } from '@/shared/services/warningService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock.ts';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/authService');

describe('skipMessage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call authFetch with proper parameters', async () => {
    vi.mocked(AuthService.authFetch, { partial: true });

    await skipMessage(2);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/warnings/2/ack', {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });
    });
  });

  it('should handle skip failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to skip warning message',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => skipMessage(3)).rejects.toThrowError('Failed to skip warning message');
  });
});

describe('fetchWarningMessagesFromType', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call authFetch with proper parameters', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockWarningMessagesWithTwo),
    });

    const result = await fetchWarningMessagesFromType(TRAJECTORY_TYPE.LOAD, 122);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/warnings?trajectoryType=LOAD&studyId=122',
      );
      expect(result).toEqual(mockWarningMessagesWithTwo);
    });
  });

  it('should handle skip failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch warning message',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    const result = await fetchWarningMessagesFromType(TRAJECTORY_TYPE.LOAD, 122);

    await waitFor(() => {
      expect(result).toEqual([]);
    });
  });
});
