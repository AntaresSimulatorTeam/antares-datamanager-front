import { AuthService } from '@/shared/services/authService.ts';
import { TrajectoryBackendError } from '@/shared/types';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';

const simulateProgress = async (duration: number, onProgress: (value: number) => void) =>
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
        resolve({});
      }
    }

    requestAnimationFrame(updateProgress);
  });

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
