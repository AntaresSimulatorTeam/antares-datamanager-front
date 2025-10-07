import { AuthService } from '@/shared/services/authService.ts';
import { TrajectoryBackendError } from '@/shared/types';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';

/**
 * Simulates progress over a specified duration, invoking a callback function with the
 * current progress percentage as it updates. The progress is calculated linearly from 0% to 100%.
 *
 * @param {number} duration - The total duration of the simulated progress in milliseconds.
 * @param {(value: number) => void} onProgress - A callback function invoked with the current progress percentage (0 to 100).
 * The progress value represents the completion percentage of the simulation.
 * @returns {Promise<void>} A Promise that resolves when the progress simulation reaches 100%.
 */
const simulateProgress = async (duration: number, onProgress: (value: number) => void): Promise<void> =>
  new Promise((resolve) => {
    let startTime: number | null = null;

    function updateProgress(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      onProgress(progress);

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(updateProgress);
  });

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
