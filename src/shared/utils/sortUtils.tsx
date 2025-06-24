import { HypothesisRowData, HypothesisRowDataWithNestedRow } from '@/shared/types';

export const sortKeepLastName = (
  arr: HypothesisRowData[] | HypothesisRowDataWithNestedRow[],
  lastName: string,
): HypothesisRowData[] | HypothesisRowDataWithNestedRow[] =>
  arr.sort((a, b) => {
    if (a.hypothesis.toUpperCase().includes(lastName)) return 1;
    if (b.hypothesis.toUpperCase().includes(lastName)) return -1;
    return a.hypothesis.localeCompare(b.hypothesis, 'en', { ignorePunctuation: true });
  });
