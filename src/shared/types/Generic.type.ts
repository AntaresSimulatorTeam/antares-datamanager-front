import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { AccessorKeyColumnDefBase, DeepKeys, DeepValue, StringOrTemplateHeader } from '@tanstack/react-table';
import { HypothesisRowData } from '@/shared/types/Trajectory.type.ts';

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

export interface BackendError {
  antaresErrorMessage: string;
  errorMessageArguments: string[];
  date: Date;
  type: ERROR_MESSAGE_TYPE;
}

export type ColumnProps<TData> = (
  | (AccessorKeyColumnDefBase<HypothesisRowData, string extends DeepKeys<TData> ? DeepValue<TData, string> : never> & {
      id?: string;
      header?: StringOrTemplateHeader<
        HypothesisRowData,
        string extends DeepKeys<TData> ? DeepValue<TData, string> : never
      >;
    })
  | (AccessorKeyColumnDefBase<HypothesisRowData, string extends DeepKeys<TData> ? DeepValue<TData, string> : never> & {
      header?: string;
      id?: string;
    })
)[];

export type CheckBoxData = {
  name: string;
  isDefault: boolean;
};

export type FileInputStatus = 'success' | 'error' | 'loading' | 'empty' | 'emptyError';
