import { PaginatedResponse, StudyDTO } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

export const mockStudy: StudyDTO = {
  id: 1,
  name: 'Project 1',
  createdBy: 'User A',
  creationDate: '2023-10-01' as unknown as Date,
  keywords: ['Keyword1', 'Keyword2'],
  project: '1',
  projectId: '5',
  status: StudyStatus.IN_PROGRESS,
  horizon: '2030-2031',
  trajectoryIds: [1, 7],
};

export const mockStudyResponse: PaginatedResponse<StudyDTO> = {
  content: [
    {
      id: 1,
      name: 'Project 1',
      createdBy: 'User A',
      creationDate: '2023-10-01' as unknown as Date,
      keywords: ['Keyword1', 'Keyword2'],
      project: '1',
      projectId: '15',
      status: StudyStatus.IN_PROGRESS,
      horizon: '2030-2031',
      trajectoryIds: [1, 7],
    },
  ],
  totalElements: 1,
};

export const mockStudyResponse2 = {
  content: [
    {
      name: 'study1',
      createdBy: 'Luis Perez',
      project: 'Project FE2050',
      status: 'Closed',
      horizon: '2050',
      keywords: 'keyword1',
      creationDate: '2023-01-01',
    },
    {
      name: 'study2',
      createdBy: 'Maria Rojas',
      project: 'Project PDH27',
      status: 'Inactive',
      horizon: '2027',
      keywords: 'keyword2',
      creationDate: '2023-01-01',
    },
  ],
  totalElements: 2,
};
