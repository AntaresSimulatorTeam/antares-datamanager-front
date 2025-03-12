import { memo } from 'react';

export const typedMemo: <T>(c: T) => T = memo;
export type WithNullableFields<T, Fields> = {
  [K in keyof T]: K extends Fields ? T[K] | null | undefined : T[K];
};
