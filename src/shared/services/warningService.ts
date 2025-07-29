import { WARNING_MESSAGES } from '@/shared/const/apiEndPoint.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { BackendError, WarningMessage } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

/**
 * Discard warning message
 * @param {number} id - Warning message id
 * @return {Promise<void>}
 */
export const skipMessage = async (id: number): Promise<void> => {
  try {
    const urlApi = `${WARNING_MESSAGES}/${id}/ack`;
    await AuthService.authFetch(urlApi, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw new Error(`${(error as BackendError).antaresErrorMessage}`);
  }
};

/**
 * Fetch warning messages by trajectory type
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 * @param {number} studyId - Study id
 * @return {Promise<WarningMessage[]>} - Promise object that represents a list of warning messages
 */
export const fetchWarningMessagesFromType = async (
  trajectoryType: TRAJECTORY_TYPE,
  studyId: number,
): Promise<WarningMessage[]> => {
  try {
    const warningsUrl = `${WARNING_MESSAGES}?trajectoryType=${trajectoryType}&studyId=${studyId}`;
    const warningsResponse = await AuthService.authFetch(warningsUrl);
    return (await (warningsResponse as Response).json()) as unknown as WarningMessage[];
  } catch {
    return [];
  }
};
