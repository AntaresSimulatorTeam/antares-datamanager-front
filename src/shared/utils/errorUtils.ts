import { BackendError } from '@/shared/types';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';

export const isBackendError = (err: unknown): err is BackendError =>
  typeof err === 'object' &&
  err !== null &&
  typeof (err as { type?: unknown }).type === 'string' &&
  'antaresErrorMessage' in err;

export const isBusinessError = (err: unknown): err is BackendError =>
  isBackendError(err) && err.type === ERROR_MESSAGE_TYPE.BUSINESS;
