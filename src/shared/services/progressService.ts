import { AuthService } from '@/shared/services/authService.ts';

const simulateProgress = async (duration: number, onProgress: (value: number) => void) =>
  new Promise((resolve) => {
    let startTime: number | null = null;

    function updateProgress(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      // progressElement.style.width = progress + '%';
      // progressElement.textContent = Math.floor(progress) + '%';
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
): Promise<[unknown, Response | Error]> => {
  const duration = 1000; // Simulate 2 seconds progress
  const progressPromise = simulateProgress(duration, onProgress);
  const fetchPromise = AuthService.authFetch(url, options);

  return await Promise.all([progressPromise, fetchPromise]);
};
