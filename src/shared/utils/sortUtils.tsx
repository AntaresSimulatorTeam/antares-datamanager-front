import { HypothesisRowData } from '@/shared/types';

export const sortKeepLastName = (arr: HypothesisRowData[], lastName: string): HypothesisRowData[] =>
  arr.sort((a, b) => {
    if (a.hypothesis === lastName) return 1;
    if (b.hypothesis === lastName) return -1;
    return a.hypothesis.localeCompare(b.hypothesis, 'en', { ignorePunctuation: true });
  });
