export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export interface ErrorMessageType {
  index: number;
  message: string;
}
