import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import { buildDataWarningMessage } from '@/shared/utils/warningUtils.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetchWarningMessages } from '@/hooks/useFetchWarningMessages.ts';
import { Mock, vi } from 'vitest';

vi.mock('@/shared/services/warningService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    fetchWarningMessagesFromType: vi.fn(),
  };
});

vi.mock('@/shared/utils/warningUtils', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    buildDataWarningMessage: vi.fn(),
  };
});

describe('useFetchWarningMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and sets warning messages for AREA type', async () => {
    const mockMessages = [{ id: 1, message: 'Warning A' }];
    const mockBuiltMessages = [{ id: 1, message: 'Built Warning A' }];

    (fetchWarningMessagesFromType as Mock).mockResolvedValueOnce(mockMessages);
    (fetchWarningMessagesFromType as Mock).mockResolvedValueOnce(mockMessages);
    (buildDataWarningMessage as Mock).mockReturnValue(mockBuiltMessages);

    const { result } = renderHook(() => useFetchWarningMessages(123, TRAJECTORY_TYPE.AREA));

    await waitFor(() => {
      expect(result.current.warningMessages.length).toBeGreaterThan(0);
      expect(fetchWarningMessagesFromType).toHaveBeenCalledTimes(2);
      expect(fetchWarningMessagesFromType).toHaveBeenCalledWith(TRAJECTORY_TYPE.AREA, 123);
      expect(fetchWarningMessagesFromType).toHaveBeenCalledWith(TRAJECTORY_TYPE.LINK, 123);
      expect(buildDataWarningMessage).toHaveBeenCalled();
      expect(result.current.warningMessages).toEqual([...mockBuiltMessages, ...mockBuiltMessages]);
    });
  });

  it('fetches and sets warning messages for LOAD type', async () => {
    const mockMessages = [{ id: 1, message: 'Warning A' }];
    const mockBuiltMessages = [{ id: 1, message: 'Built Warning A' }];

    (fetchWarningMessagesFromType as Mock).mockResolvedValueOnce(mockMessages);
    (buildDataWarningMessage as Mock).mockReturnValue(mockBuiltMessages);

    const { result } = renderHook(() => useFetchWarningMessages(123, TRAJECTORY_TYPE.LOAD));

    await waitFor(() => {
      expect(result.current.warningMessages.length).toBeGreaterThan(0);
      expect(fetchWarningMessagesFromType).toHaveBeenCalledTimes(1);
      expect(fetchWarningMessagesFromType).toHaveBeenCalledWith(TRAJECTORY_TYPE.LOAD, 123);
      expect(buildDataWarningMessage).toHaveBeenCalled();
      expect(result.current.warningMessages).toEqual(mockBuiltMessages);
    });
  });

  it('fetches and sets warning messages for THERMAL_CAPACITY type', async () => {
    const mockMessages = [{ id: 1, message: 'Warning A' }];
    const mockBuiltMessages = [{ id: 1, message: 'Built Warning A' }];

    (fetchWarningMessagesFromType as Mock).mockResolvedValueOnce(mockMessages);
    (buildDataWarningMessage as Mock).mockReturnValue(mockBuiltMessages);

    const { result } = renderHook(() => useFetchWarningMessages(123, TRAJECTORY_TYPE.THERMAL_CAPACITY));

    await waitFor(() => {
      expect(result.current.warningMessages.length).toBeGreaterThan(0);
      expect(fetchWarningMessagesFromType).toHaveBeenCalledTimes(4);
      expect(fetchWarningMessagesFromType).toHaveBeenCalledWith(
        TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
        123,
      );
      expect(fetchWarningMessagesFromType).toHaveBeenCalledWith(
        TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
        123,
      );
      expect(fetchWarningMessagesFromType).toHaveBeenCalledWith(
        TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
        123,
      );
      expect(buildDataWarningMessage).toHaveBeenCalled();
      expect(result.current.warningMessages).toEqual(mockBuiltMessages);
    });
  });

  it('does not fetch warning messages for DSR type', async () => {
    const { result } = renderHook(() => useFetchWarningMessages(123, TRAJECTORY_TYPE.DSR));

    await waitFor(() => {
      expect(result.current.warningMessages).toBeUndefined();
    });
  });
});
