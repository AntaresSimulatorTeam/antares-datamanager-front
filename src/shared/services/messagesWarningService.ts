import { Dispatch } from 'react';
import { TRAJECTORY_TYPE } from '../enum/trajectory';
import { BackendError, StudyActionType, WarningMessage } from '@/shared/types';
import { fetchWarningMessagesFromType, skipMessage } from './warningService';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

/**
 * @param {number} id - Warning message id
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 * @param {number} studyId - Study id
 * @param {Dispatch<StudyActionType>} dispatch
 *
 * @return {Promise<void>}
 */
export const discardWarningMessage = async (
  id: number,
  trajectoryType: TRAJECTORY_TYPE,
  studyId: number,
  dispatch: Dispatch<StudyActionType>,
): Promise<void> => {
  try {
    await skipMessage(id);
    const warningMessages: WarningMessage[] = await fetchWarningMessagesFromType(trajectoryType, studyId);
    dispatch?.({ type: STUDY_ACTION.SKIP_MESSAGE, payload: { trajectoryType, warningMessages } });
  } catch (error) {
    throw new Error(`${(error as BackendError).antaresErrorMessage}`);
  }
};
