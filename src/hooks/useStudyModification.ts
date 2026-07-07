import { useCallback } from 'react';
import { duplicateStudy, updateStudy } from '@/shared/services/studyService.ts';
import { StudyDTO } from '@/shared/types';

export const useStudyModification = (onSuccess?: () => void, onError?: (message: string) => void) => {
  const confirmUpdate = useCallback(
    async (studyId: number, studyData: StudyDTO, isDuplicateMode: boolean) => {
      try {
        isDuplicateMode ? await duplicateStudy(studyData) : await updateStudy(studyData, studyId);
        onSuccess?.();
      } catch (error) {
        onError?.((error as Error)?.message);
      }
    },
    [onError, onSuccess],
  );

  return { confirmUpdate };
};
