import {
  convertToFSSelectionOptionType,
  convertToSelectionOptionType,
  isRepositoryTrajectory,
} from '@/shared/utils/formFormatter.ts';
import {
  mockDbTrajectoryArray,
  mockFsTrajectoryAreaArray,
  mockFsTrajectoryLoadArray,
  mockFsTrajectoryParaModulationArray,
  mockFsTrajectoryResArray,
  mockFsTrajectoryResFRArray,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

describe('convertToSelectionOptionType', () => {
  it('should return an array of SelectOption type when array of DbTrajectory as an argument', () => {
    expect(convertToSelectionOptionType(mockDbTrajectoryArray)).toEqual([
      { id: 1, label: 'area_PB_2024' },
      { id: 2, label: 'area_PB_2026' },
    ]);
  });
  it('should return an empty array when empty as an argument', () => {
    expect(convertToSelectionOptionType([])).toEqual([]);
  });
});

describe('convertToFSSelectionOptionType', () => {
  it('should return an array of SelectOption type without file format within label when array of AREA as an argument', () => {
    expect(convertToFSSelectionOptionType(mockFsTrajectoryAreaArray)).toEqual([
      { id: 0, label: 'area_BP_2028' },
      { id: 1, label: 'area_BP_2027' },
      { id: 2, label: 'area_BP_2030_2050' },
    ]);
  });
  it('should return an array of SelectOption type in which label is the trajectory name when array of LOAD as an argument', () => {
    expect(convertToFSSelectionOptionType(mockFsTrajectoryLoadArray)).toEqual([
      { id: 0, label: 'BP23_TEST_LOAD' },
      { id: 1, label: 'BP23_LOAD_3332' },
      { id: 2, label: 'BP23_AREF_EU_coherence_scenario6' },
      { id: 3, label: 'BP23_AREF_EU_CBN_VIDE' },
    ]);
  });
  it('should return an array of SelectOption type in which label is the trajectory name when array of THERMAL_TECHNICAL_MODULATION_PARAMETER as an argument', () => {
    expect(convertToFSSelectionOptionType(mockFsTrajectoryParaModulationArray)).toEqual([
      { id: 0, label: 'params' },
      { id: 1, label: 'params_2' },
      { id: 2, label: 'params_PEMMDB' },
    ]);
  });
  it('should return an array of SelectOption type in which label is the trajectory name when array of RES as an argument', () => {
    expect(convertToFSSelectionOptionType(mockFsTrajectoryResArray)).toEqual([
      { id: 0, label: 'installedRES_BP_2028' },
      { id: 1, label: 'installedRES_BP_2027' },
      { id: 2, label: 'installedRES_BP_2030_2050' },
    ]);
  });
  it('should return an array of SelectOption type in which label is the trajectory name when array of RES - FR as an argument', () => {
    expect(convertToFSSelectionOptionType(mockFsTrajectoryResFRArray, 'FR')).toEqual([
      { id: 0, label: 'BP_REF_A' },
      { id: 1, label: 'BP_REF_B' },
      { id: 2, label: 'BP_REF_C' },
    ]);
  });
  it('should return an empty array when empty array as an argument', () => {
    expect(convertToSelectionOptionType([])).toEqual([]);
  });
});

describe('isRepositoryTrajectory', () => {
  it('should return false for TRAJECTORY_TYPE AREA', () => {
    expect(isRepositoryTrajectory(TRAJECTORY_TYPE.AREA)).toBeFalsy();
  });
  it('should return false for TRAJECTORY_TYPE LINK', () => {
    expect(isRepositoryTrajectory(TRAJECTORY_TYPE.LINK)).toBeFalsy();
  });
  it('should return true for TRAJECTORY_TYPE LOAD', () => {
    expect(isRepositoryTrajectory(TRAJECTORY_TYPE.LOAD)).toBeTruthy();
  });
  it('should return false for TRAJECTORY_TYPE THERMAL_TECHNICAL_MODULATION_PARAMETER', () => {
    expect(isRepositoryTrajectory(TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER)).toBeTruthy();
  });
});
