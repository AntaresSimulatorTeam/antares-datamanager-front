import { ERROR_MESSAGE } from '@/shared/enum/warning.ts';
import { Dispatch, SetStateAction } from 'react';

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export interface ErrorMessageType {
  index: number;
  message: string;
}

export interface ErrorMessage {
  antaresErrorMessage: string;
  errorMessageArguments: string[];
  date: Date;
  type: ERROR_MESSAGE;
}

export type TabProps = {
  setErrorMessage: Dispatch<SetStateAction<string>>;
};
