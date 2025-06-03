import { ProjectInfo } from '@/shared/types';

export const mockProjectInfo: ProjectInfo = {
  id: '123',
  name: 'Project Name',
  description: 'Project Description',
  createdBy: 'User A',
  creationDate: '2024-01-01' as unknown as Date,
  tags: ['tag1', 'tag2'],
  path: '',
  studies: [],
};

export const mockProjectInfoArray: ProjectInfo[] = [
  {
    id: '123',
    name: 'Bilan prévisionnel 2023',
    description: 'Project Description',
    createdBy: 'User A',
    creationDate: '2024-01-01' as unknown as Date,
    tags: ['tag1', 'tag2'],
    path: '',
    studies: [],
  },
  {
    id: '123',
    name: 'Bilan prévisionnel 2019',
    description: 'Project Description',
    createdBy: 'User B',
    creationDate: '2013-08-01' as unknown as Date,
    tags: ['tag3', 'tag4'],
    path: '',
    studies: [],
  },
];

export const projectData = { name: 'Bilan prévisionnel 2050', description: '', tags: ['tag1'] };

export const mockProjectCreation = {
  id: 107,
  name: projectData.name,
  createdBy: 'pegase',
  creationDate: '2025-01-30T10:32:10.631003175',
  studies: [],
  tags: projectData.tags,
  description: projectData.description,
};
