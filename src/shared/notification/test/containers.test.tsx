import { afterEach, describe, expect, it, Mock, vi } from 'vitest';
import { render } from '@testing-library/react';
import { NotificationContainer, PegaseToastContainer } from '@/shared/notification/containers.tsx';
import { ToastContainerProps } from 'react-toastify';

vi.mock('react-toastify', () => ({
  ToastContainer: (props: any) => <div data-testid="toast-container" {...props} />,
}));

describe('NotificationContainer', () => {
  it('should render ToastContainer with the proper props', () => {
    const { getByTestId } = render(<NotificationContainer autoClose={5000} theme="dark" />);
    const container = getByTestId('toast-container');

    expect(container).toBeDefined();
    expect(container.getAttribute('autoClose')).toBe('5000');
    expect(container.getAttribute('theme')).toBe('dark');
  });
});

vi.mock('@/shared/notification/containers', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  const createMockContainer = (testId: string) =>
    vi.fn().mockImplementation((props: ToastContainerProps) => {
      const safeProps = {
        ...props,
        'data-testid': testId,
        role: 'alert',
        className: '' as string,
        position: 'top-center',
      };
      // @ts-ignore
      return <div {...safeProps} />;
    });

  return {
    ...actual,
    NotificationContainer: createMockContainer('toast-container'),
    PegaseAlertContainer: createMockContainer('alert-container'),
    PegaseBannerContainer: createMockContainer('banner-container'),
    ToastContainerId: 'toast',
    AlertContainerId: 'alert',
    BannerContainerId: 'banner',
  };
});

describe('PegaseToastContainer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should render NotificationContainer with the proper props', () => {
    render(<PegaseToastContainer />);
    const notificationContainerMock = vi.mocked(NotificationContainer);
    const mockNotificationCalls = notificationContainerMock.mock.calls;
    expect(mockNotificationCalls.length).toBeGreaterThan(0);
    expect(mockNotificationCalls[0]).toBeDefined();

    const props = mockNotificationCalls[0][0];
    expect(props).toMatchObject({
      autoClose: 5000,
      theme: 'dark',
    });
  });
});
