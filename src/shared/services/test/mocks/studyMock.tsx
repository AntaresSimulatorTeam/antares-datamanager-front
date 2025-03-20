import { PaginatedResponse, StudyDTO } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

export const mockStudyResponse: PaginatedResponse<StudyDTO> = {
  content: [
    {
      id: 1,
      name: 'Project 1',
      createdBy: 'User A',
      creationDate: '2023-10-01' as unknown as Date,
      keywords: ['Keyword1', 'Keyword2'],
      project: '1',
      status: StudyStatus.IN_PROGRESS,
      horizon: '2030-2031',
      trajectoryIds: [1, 7],
    },
  ],
  totalElements: 1,
};

export const mockStudy: StudyDTO = {
  id: 1,
  name: 'Project 1',
  createdBy: 'User A',
  keywords: ['Keyword1', 'Keyword2'],
  project: '1',
  horizon: '2030-2031',
  trajectoryIds: [1, 7],
};
