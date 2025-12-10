import { DEFAULT_CONFIG_AREAS, DEFAULT_CONFIG_INSTALLED_POWER_TECHNOLOGY } from '@/shared/const/apiEndPoint.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { BackendError } from '@/shared/types';

/**
 * Fetch load default hypothesis (LOAD_OTHERS, LOAD_FR...)
 * @return {Promise<{ name: string }[]>}
 * @throws {Error}
 */
export const getDefaultAreas = async (): Promise<{ name: string }[]> => {
  try {
    const response = await AuthService.authFetch(DEFAULT_CONFIG_AREAS);
    return (await (response as Response).json()) as { name: string }[];
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Fetch technology list for Installed power (Biomass, CCGT, Nuclear...)
 * @return {Promise<{ name: string }[]>}
 * @throws {Error}
 */
export const getThermalTechnologyList = async (): Promise<{ name: string }[]> => {
  try {
    const response = await AuthService.authFetch(DEFAULT_CONFIG_INSTALLED_POWER_TECHNOLOGY);
    return (await (response as Response).json()) as { name: string }[];
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};
