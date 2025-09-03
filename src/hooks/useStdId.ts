import { useId } from 'react';

export const useStdId = (prefix: string, id?: string): string => {
  const reactId = useId();
  return id || `${prefix}-${reactId}`;
};
