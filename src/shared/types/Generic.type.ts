export type WithNullableFields<T, Fields> = {
  [K in keyof T]: K extends Fields ? T[K] | null | undefined : T[K];
};

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export interface ErrorMessageType {
  index: number;
  message: string;
}
