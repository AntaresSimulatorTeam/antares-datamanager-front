import { saveStudy } from '@/shared/services/studyService.ts';
import { useCallback } from 'react';
import { StudyDataCreation } from '@/shared/types';

export const useStudyCreation = (onSuccess?: () => void, onError?: (message: string) => void) => {
  const confirmCreation = useCallback(
    async (studyData: StudyDataCreation) => {
      try {
        await saveStudy(studyData);
        onSuccess?.();
      } catch (error) {
        const errorMessages = (error as Error)?.message;
        if (errorMessages?.includes('study')) {
          onError?.(errorMessages);
        }
      }
    },
    [onError, onSuccess],
  );

  return { confirmCreation };
};
