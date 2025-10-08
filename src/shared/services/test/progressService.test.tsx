import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithProgress } from '@/shared/services/progressService';
import * as errorUtils from '@/shared/utils/errorUtils.ts';
import { TrajectoryBackendError } from '@/shared/types';
import * as hypothesisTableUtils from '@/shared/utils/hypothesisTableUtils.ts';
import { AuthService } from '@/shared/services/authService.ts';

const mockResponse = new Response('OK', { status: 200 });

vi.mock('@/shared/utils/hypothesisTableUtils', () => ({
  simulateProgress: vi.fn(),
}));

vi.mock('@/shared/services/authService');

vi.mock('@/shared/utils/errorUtils', () => ({
  isBusinessError: vi.fn(),
}));

describe('fetchWithProgress', () => {
  const url = 'https://example.com/api';
  const options = { method: 'POST' };
  const onProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call simulateProgress and then authFetch', async () => {
    vi.mocked(hypothesisTableUtils.simulateProgress).mockResolvedValueOnce(undefined);
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce(mockResponse);

    const result = await fetchWithProgress(url, options, onProgress);

    expect(hypothesisTableUtils.simulateProgress).toHaveBeenCalledWith(2000, onProgress);
    expect(AuthService.authFetch).toHaveBeenCalledWith(url, options);
    expect(result).toBe(mockResponse);
  });

  it('should throw business error if caught', async () => {
    const businessError = new Error('Business error');
    vi.mocked(hypothesisTableUtils.simulateProgress).mockResolvedValueOnce(undefined);
    vi.mocked(AuthService.authFetch, { partial: true }).mockRejectedValueOnce(businessError);
    vi.mocked(errorUtils.isBusinessError).mockReturnValue(true);

    await expect(fetchWithProgress(url, options, onProgress)).rejects.toThrow(businessError);
  });

  it('should throw TrajectoryBackendError for non-business errors', async () => {
    const genericError = new Error('Network error');
    vi.mocked(hypothesisTableUtils.simulateProgress).mockResolvedValueOnce(undefined);
    vi.mocked(AuthService.authFetch, { partial: true }).mockRejectedValueOnce(genericError);
    vi.mocked(errorUtils.isBusinessError).mockReturnValue(false);

    await expect(fetchWithProgress(url, options, onProgress)).rejects.toThrow(TrajectoryBackendError);
  });
});
