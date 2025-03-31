import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';

const mockMessages = [
  {
    id: 1,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
  },
  {
    id: 2,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
  },
  {
    id: 3,
    content: 'this is an error message',
    level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
  },
  {
    id: 4,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
  },
];
