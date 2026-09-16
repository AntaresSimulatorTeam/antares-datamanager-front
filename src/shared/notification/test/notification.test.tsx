import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { notifyAlert, notifyToast } from '@/shared/notification/notification.tsx';
import { DisplayStatus } from '@/shared/types';
import { AlertAction } from '@common/layout/stdAlert/StdAlert.tsx';

vi.mock('react-toastify', () => {
  const toastFn = vi.fn();
  Object.assign(toastFn, {
    clearWaitingQueue: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  });

  return {
    __esModule: true, // tells Vitest you're mocking an ES module.
    default: toastFn,
    toast: toastFn,
    ToastContainerId: 'container-id',
  };
});

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

describe('notifyToast', () => {
  const baseProps = {
    message: 'Hello world',
    type: 'success',
    action: () => {},
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should use proper id', () => {
    vi.mocked(toast.clearWaitingQueue).mockImplementationOnce(() => {});
    notifyToast({
      message: baseProps.message,
      type: baseProps.type as DisplayStatus,
      action: baseProps.action as unknown as AlertAction,
      id: 'custom-id',
    });
    expect(toast.clearWaitingQueue).toHaveBeenCalledWith({ containerId: 'toast' });
    expect(toast.dismiss).toHaveBeenCalledWith({ containerId: 'toast' });
    expect(toast).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ toastId: 'custom-id' }));
  });

  it('should generate a new id', () => {
    notifyToast({
      message: baseProps.message,
      type: baseProps.type as DisplayStatus,
      action: baseProps.action as unknown as AlertAction,
    });
    expect(uuidv4).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ toastId: 'mock-uuid' }));
  });
});

describe('notifyAlert', () => {
  const mockProps = {
    message: 'Alerte test',
    content: 'Contenu détaillé',
    type: 'warning' as DisplayStatus,
    action: vi.fn() as unknown as AlertAction,
    icon: 'alert-icon',
    filledIcon: true,
  };

  it('should use the id provided', () => {
    notifyAlert({ ...mockProps, id: 'custom-id' });
    expect(toast).toHaveBeenCalledWith(expect.anything(), {
      toastId: 'custom-id',
      containerId: 'alert',
      type: 'warning',
    });
  });

  it('should create a new id', () => {
    notifyAlert(mockProps);
    expect(uuidv4).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.anything(), {
      toastId: 'mock-uuid',
      containerId: 'alert',
      type: 'warning',
    });
  });

  it('should include Alert component with proper props', () => {
    const toastMock = vi.mocked(toast);
    const mockCalls = toastMock.mock.calls;
    expect(mockCalls.length).toBeGreaterThan(0);
    expect(mockCalls[0]).toBeDefined();

    type ToastCallProps = {
      props: {
        message: string;
        content: string;
        status: DisplayStatus;
        onClose: () => void;
        icon: string;
        filledIcon: boolean;
      };
    };

    const toastCall = mockCalls[0][0] as ToastCallProps;

    expect(toastCall?.props.message).toBe('Alerte test');
    expect(toastCall?.props.content).toBe('Contenu détaillé');
    expect(toastCall?.props.status).toBe('warning');
    expect(typeof toastCall?.props.onClose).toBe('function');
    expect(toastCall.props.icon).toBe('alert-icon');
    expect(toastCall.props.filledIcon).toBe(true);
  });
});
