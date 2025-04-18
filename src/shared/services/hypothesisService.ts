import { AuthService } from '@/shared/services/authService.ts';
import { HYPOTHESIS_LOAD_DEFAULT } from '@/shared/const/apiEndPoint.ts';

/**
 * Fetch load default hypothesis (LOAD_OTHERS, LOAD_FR...)
 */
export const getDefaultLoadHypothesis = async (): Promise<{ name: string }[]> => {
  const response = await AuthService.authFetch(HYPOTHESIS_LOAD_DEFAULT);
  if (!response.ok) {
    throw new Error('Failed to fetch default load hypothesis');
  }
  return (await response.json()) as { name: string }[];
};
