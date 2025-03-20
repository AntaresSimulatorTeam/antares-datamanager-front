import { ProjectInfo } from '@/shared/types/index.js';

export const mockProjectsApiResponse: ProjectInfo[] = [
  {
    id: '1',
    name: 'Bilan previsionnel 2027',
    createdBy: 'MOUAD Paris test',
    creationDate: '2024-07-25T10:09:41' as unknown as Date,
    studies: [1, 2, 3],
    tags: ['gaz', 'elec', 'antares', 'misc', 'tag2 antares', 'area link'],
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    pinned: true,
    path: '',
  },
  {
    id: '2',
    name: 'Bilan previsionnel 2023',
    createdBy: 'Taher benjelloun amine',
    creationDate: '2024-07-25T10:09:41' as unknown as Date,
    studies: [6, 5, 9],
    tags: ['bilan 22'],
    description: 'description2023',
    pinned: true,
    path: '',
  },
  {
    id: '3',
    name: 'Bilan previsionnel 2025',
    createdBy: 'zayd guillaume pegase',
    creationDate: '2024-07-25T10:09:41' as unknown as Date,
    studies: [7, 8],
    tags: ['figma', 'config', 'modal'],
    description: 'In the world of software development, achieving perfection is a journey rather than a destination.',
    pinned: true,
    path: '',
  },
];

export const mockPinProjectResponse: ProjectInfo = {
  id: '3',
  name: 'Bilan previsionnel 2025',
  createdBy: 'zayd guillaume pegase',
  creationDate: '2024-07-25T10:09:41' as unknown as Date,
  studies: [7, 8],
  tags: ['figma', 'config', 'modal'],
  description: 'In the world of software development, achieving perfection is a journey rather than a destination.',
  pinned: true,
  path: '',
};

export const mockResponseArray = [
  {
    id: '123',
    projectId: '123',
    name: 'Project Name',
    description: 'Project Description',
    createdBy: 'User A',
    creationDate: '2024-01-01',
    tags: ['tag1', 'tag2'],
    archived: true,
    pinned: true,
    path: '',
    studies: [1, 2],
  },
  {
    id: '124',
    projectId: '124',
    name: 'Project Name 3',
    description: 'Project Description',
    createdBy: 'User A',
    creationDate: '2024-01-01',
    tags: ['tag1', 'tag2'],
    archived: true,
    pinned: true,
    path: '',
    studies: [1, 2],
  },
];

export const mockResponse = {
  id: '123',
  name: 'Project Name',
  description: 'Project Description',
  createdBy: 'User A',
  creationDate: '2024-01-01',
  tags: ['tag1', 'tag2'],
};
