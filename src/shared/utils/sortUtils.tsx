import { HypothesisRowData } from '@/shared/types';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

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

export const sortWithFixedPosition = (arr: HypothesisRowData[]): HypothesisRowData[] => {
  const fixedFirstItems: HypothesisRowData[] = [];
  const fixedLastItems: HypothesisRowData[] = [];
  const toSort = arr.filter((item) => {
    if (!item.isDefault) {
      return item;
    } else {
      item.hypothesis !== OTHER_AREAS_LABEL ? fixedFirstItems.push(item) : fixedLastItems.push(item);
    }
  });

  // Sort the non-fixed items
  toSort.sort((a, b) => a.hypothesis.localeCompare(b.hypothesis)); // Customize the sort logic as needed

  return [...fixedFirstItems, ...toSort, ...fixedLastItems];
};
