import { Dispatch, SetStateAction } from 'react';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type WithNullableFields<T, Fields> = {
  [K in keyof T]: K extends Fields ? T[K] | null | undefined : T[K];
};

export interface ErrorMessageType {
  index: number;
  message: string;
}

export interface ErrorMessage {
  antaresErrorMessage: string;
  errorMessageArguments: string[];
  date: Date;
  type: ERROR_MESSAGE_TYPE;
}

export type TabProps = {
  setErrorMessage: Dispatch<SetStateAction<string>>;
};
