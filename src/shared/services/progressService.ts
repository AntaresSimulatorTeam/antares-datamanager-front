import { AuthService } from '@/shared/services/authService.ts';
import { BackendError } from '@/shared/utils/errrorHandler.ts';

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
): Promise<Response | BackendError | void> => {
  const duration = 2000;
  const progressPromise = simulateProgress(duration, onProgress);
  const fetchPromise = AuthService.authFetch(url, options);

  return progressPromise
    .then(() => fetchPromise.then((result) => result).catch((error: BackendError) => error))
    .catch((error: BackendError) => error);
};
