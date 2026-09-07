import { act, renderHook } from '@testing-library/react';
import * as studyService from '@/shared/services/studyService.ts';
import { duplicateStudy, updateStudy } from '@/shared/services/studyService.ts';
import { useStudyModification } from '@/hooks/useStudyModification.ts';
import { vi } from 'vitest';
import { StudyDTO } from '@/shared/types';

vi.mock('@/shared/services/studyService');

describe('useStudyModification', () => {
  const mockUpdateStudy = vi.mocked(studyService.updateStudy);
  const mockDuplicateStudy = vi.mocked(studyService.duplicateStudy);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a study when isDuplicateMode is false, then calls onSuccess', async () => {
    mockUpdateStudy.mockResolvedValue(undefined);

    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useStudyModification(onSuccess, onError));

    await act(async () => {
      await result.current.confirmUpdate(10, { name: 'Updated Study' } as StudyDTO, false);
    });

    expect(updateStudy).toHaveBeenCalledWith({ name: 'Updated Study' }, 10);
    expect(duplicateStudy).not.toHaveBeenCalled();

    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('duplicates a study when isDuplicateMode is true, then calls onSuccess', async () => {
    mockDuplicateStudy.mockResolvedValue(undefined);

    const onSuccess = vi.fn();

    const { result } = renderHook(() => useStudyModification(onSuccess));

    await act(async () => {
      await result.current.confirmUpdate(5, { name: 'Duplicate Study' } as StudyDTO, true);
    });

    expect(duplicateStudy).toHaveBeenCalledWith({ name: 'Duplicate Study' });
    expect(updateStudy).not.toHaveBeenCalled();

    expect(onSuccess).toHaveBeenCalled();
  });

  it('calls onError when updateStudy fails', async () => {
    mockUpdateStudy.mockRejectedValue({antaresErrorMessage: 'Update failed'});

    const onError = vi.fn();

    const { result } = renderHook(() => useStudyModification(undefined, onError));

    await act(async () => {
      await result.current.confirmUpdate(3, { name: 'Bad Update' } as StudyDTO, false);
    });

    expect(onError).toHaveBeenCalledWith({antaresErrorMessage: "Update failed"});
  });

  it('calls onError when duplicateStudy fails', async () => {
    mockDuplicateStudy.mockRejectedValue({antaresErrorMessage: 'Duplicate failed'});

    const onError = vi.fn();

    const { result } = renderHook(() => useStudyModification(undefined, onError));

    await act(async () => {
      await result.current.confirmUpdate(3, { name: 'Bad Duplicate' } as StudyDTO, true);
    });

    expect(onError).toHaveBeenCalledWith({antaresErrorMessage: "Duplicate failed"});
  });
});
