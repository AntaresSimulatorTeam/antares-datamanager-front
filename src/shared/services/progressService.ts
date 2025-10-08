import { AuthService } from '@/shared/services/authService.ts';
import { TrajectoryBackendError } from '@/shared/types';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';
import { simulateProgress } from '@/shared/utils/hypothesisTableUtils.ts';

/**
 * Fetches a resource from a specified URL while reporting progress.
 *
 * This function performs an HTTP request and optionally simulates progress updates
 * to inform the onProgress callback about the progress percentage over a fixed duration.
 * After completion of the progress simulation, it proceeds with the actual fetch operation.
 *
 * @param {string} url - The URL of the resource to fetch.
 * @param {RequestInit} [options={}] - The configuration options for the fetch request.
 * @param {(value: number) => void} onProgress - A callback function invoked with the progress value
 *   (between 0 and 100) representing the simulated progress of the operation.
 * @returns {Promise<Response>} A promise that resolves with the Response of the fetch operation.
 * @throws {Error} If an unrecoverable error occurs, it throws either a business error or a
 *   custom TrajectoryBackendError with additional information about the failure.
 */
export const fetchWithProgress = async (
  url: string,
  options: RequestInit = {},
  onProgress: (value: number) => void,
): Promise<Response> => {
  const duration = 2000;

  try {
    await simulateProgress(duration, onProgress);
    return (await AuthService.authFetch(url, options)) as Response;
  } catch (error) {
    if (isBusinessError(error)) {
      throw error;
    } else {
      throw new TrajectoryBackendError(`Failed to upload trajectory`, error);
    }
  }
};
