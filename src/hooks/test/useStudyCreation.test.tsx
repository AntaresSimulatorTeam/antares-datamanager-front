import { act, renderHook } from '@testing-library/react';
import * as studyService from '@/shared/services/studyService.ts';
import { createStudy } from '@/shared/services/studyService.ts';
import { useStudyCreation } from '@/hooks/useStudyCreation.ts';
import { vi } from 'vitest';
import { StudyDataCreation } from '@/shared/types';

vi.mock('@/shared/services/studyService');

describe('useStudyCreation', () => {
  const mockSaveStudy = vi.mocked(studyService.createStudy);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls createStudy and then onSuccess on success', async () => {
    mockSaveStudy.mockResolvedValue(undefined);

    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useStudyCreation(onSuccess, onError));

    await act(async () => {
      await result.current.confirmCreation({ name: 'Study A' } as StudyDataCreation);
    });

    expect(createStudy).toHaveBeenCalledWith({ name: 'Study A' });
    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError when error message contains "study"', async () => {
    mockSaveStudy.mockRejectedValue(new Error('study creation failed'));

    const onError = vi.fn();

    const { result } = renderHook(() => useStudyCreation(undefined, onError));

    await act(async () => {
      await result.current.confirmCreation({ name: 'Bad Study' } as StudyDataCreation);
    });

    expect(onError).toHaveBeenCalledWith('study creation failed');
  });

  it('does NOT call onError when error message does not contain "study"', async () => {
    mockSaveStudy.mockRejectedValue(new Error('network error'));

    const onError = vi.fn();

    const { result } = renderHook(() => useStudyCreation(undefined, onError));

    await act(async () => {
      await result.current.confirmCreation({ name: 'Study X' } as StudyDataCreation);
    });

    expect(onError).not.toHaveBeenCalled();
  });
});
