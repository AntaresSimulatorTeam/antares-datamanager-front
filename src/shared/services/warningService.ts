import { WARNING_MESSAGE_SKIP } from '@/shared/const/apiEndPoint.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { StudyActionType } from '@/shared/types';
import { Dispatch } from 'react';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { BackendError } from '@/shared/utils/errrorHandler.ts';

/**
 * Discard warning message
 * @param {number} id - Warning message id
 * @return {Promise<void>}
 */
export const skipMessage = async (id: number): Promise<void> => {
  const urlApi = `${WARNING_MESSAGE_SKIP}/${id}/ack`;
  const response = await AuthService.authFetch(urlApi, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!(response as Response).ok) {
    throw new Error(`${(response as BackendError).antaresErrorMessage}`);
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
