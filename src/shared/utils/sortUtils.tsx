import { HypothesisRowData } from '@/shared/types';

export const sortKeepLastName = (arr: HypothesisRowData[], lastName: string): HypothesisRowData[] =>
  arr.sort((a, b) => {
    if (
      a.hypothesis.toUpperCase().includes(lastName.toUpperCase()) &&
      !b.hypothesis.toUpperCase().includes(lastName.toUpperCase())
    )
      return 1;
    if (
      b.hypothesis.toUpperCase().includes(lastName.toUpperCase()) &&
      !a.hypothesis.toUpperCase().includes(lastName.toUpperCase())
    )
      return -1;
    return a.hypothesis.localeCompare(b.hypothesis, 'en', { ignorePunctuation: true });
  });
