import { useCallback, useState } from 'react';
import { duplicateStudy, updateStudy } from '@/shared/services/studyService.ts';
import { BackendError, StudyDTO } from '@/shared/types';

export const useStudyModification = (onSuccess?: () => void, onError?: (error: BackendError) => void) => {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const confirmUpdate = useCallback(
    async (studyId: number, studyData: StudyDTO, isDuplicateMode: boolean) => {
      try {
        if (isDuplicateMode) {
          setIsDuplicating(true);
          await duplicateStudy(studyData);
        } else {
          await updateStudy(studyData, studyId);
        }
        onSuccess?.();
      } catch (error) {
        onError?.((error as BackendError));
      } finally {
        if (isDuplicateMode) {
          setIsDuplicating(false);
        }
      }
    },
    [onError, onSuccess],
  );

  return { confirmUpdate, isDuplicating };
};
