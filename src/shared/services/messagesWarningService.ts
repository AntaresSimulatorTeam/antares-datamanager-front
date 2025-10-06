import { BackendError } from '@/shared/types';
import { skipMessage } from './warningService';

/**
 * @param {number} id - Warning message id
 * @return {Promise<void>}
 */
export const discardWarningMessage = async (id: number): Promise<void> => {
  try {
    await skipMessage(id);
  } catch (error) {
    throw new Error(`${(error as BackendError).antaresErrorMessage}`);
  }
};
