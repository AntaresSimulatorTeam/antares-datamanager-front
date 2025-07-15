import { HypothesisRowData } from '@/shared/types';
import { Dispatch, SetStateAction } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { retrieveReadOnlyArea } from '@/shared/utils/trajectoryUtils.ts';

export const setReadOnlyForGeneratedStudy = (
  rows: HypothesisRowData[],
  setReadOnly: Dispatch<SetStateAction<ReadOnlyObject>>,
) => {
  const areaWithoutTrajectory = rows.map((row) => (row.trajectory == null ? row.hypothesis : null));
  const readOnlyRows = retrieveReadOnlyArea(rows, areaWithoutTrajectory.filter(Boolean) as string[]);
  setReadOnly(readOnlyRows);
};