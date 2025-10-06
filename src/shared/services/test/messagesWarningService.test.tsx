import { Mock, vi } from 'vitest';
import { discardWarningMessage } from '@/shared/services/messagesWarningService.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning';
import { skipMessage } from '@/shared/services/warningService.ts';

vi.mock('@/shared/services/warningService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    skipMessage: vi.fn(),
  };
});

describe('discardWarningMessage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call authFetch with proper parameters', async () => {
    await discardWarningMessage(105);
    expect(skipMessage).toHaveBeenCalledWith(105);
  });

  it('should handle discard warning message failure gracefully', async () => {
    vi.mocked(skipMessage).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to discard warning message',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => discardWarningMessage(105)).rejects.toThrowError('Failed to discard warning message');
  });
});
