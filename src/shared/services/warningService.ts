import { WARNING_MESSAGES } from '@/shared/const/apiEndPoint.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { BackendError, StudyActionType, WarningMessage } from '@/shared/types';
import { Dispatch } from 'react';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
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
 * @param {number} id - Warning message id
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 * @param {number} trajectoryId - Trajectory id
 * @param {Dispatch<StudyActionType>} dispatch
 *
 * @return {Promise<void>}
 */
export const discardWarningMessage = async (
  id: number,
  trajectoryType: TRAJECTORY_TYPE,
  trajectoryId: number,
  dispatch: Dispatch<StudyActionType>,
): Promise<void> => {
  try {
    await skipMessage(id);
    dispatch?.({ type: STUDY_ACTION.SKIP_MESSAGE, payload: { id, trajectoryType, trajectoryId } });
  } catch {
    // Silent handler
  }
};

/**
 * Fetch warning messages for a trajectory
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
    return (await (warningsResponse as Response).json()) as WarningMessage[];
  } catch {
    return [];
  }
};
