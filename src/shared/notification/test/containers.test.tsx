import { afterEach, describe, expect, it, Mock, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
  NotificationContainer,
  PegaseAlertContainer,
  PegaseToastContainer,
} from '@/shared/notification/containers.tsx';
import { ToastContainerProps } from 'react-toastify';

vi.mock('react-toastify', () => ({
  ToastContainer: (props: any) => <div data-testid="toast-container" {...props} />,
}));

vi.mock('@/shared/notification/containers', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  // eslint-disable-next-line react/display-name
  const createMockContainer = (testId: string) => (props: ToastContainerProps) => {
    const safeProps = {
      ['data-testid']: testId,
      role: 'alert',
      className: 'top-center',
      position: 'top-center',
      ...props,
    };
    // @ts-ignore
    return <div {...safeProps} />;
  };

  return {
    ...actual,
    NotificationContainer: createMockContainer('toast-container'),
  };
});

describe('NotificationContainer', () => {
  it('should render ToastContainer with the proper props', () => {
    const { getByTestId } = render(<NotificationContainer autoClose={5000} theme="dark" />);
    const container = getByTestId('toast-container');

    expect(container).toBeDefined();
    expect(container.getAttribute('autoClose')).toBe('5000');
    expect(container.getAttribute('theme')).toBe('dark');
  });
});

describe('PegaseToastContainer', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should render PegaseToastContainer with the proper props', () => {
    const { getByTestId } = render(<PegaseToastContainer />);
    const container = getByTestId('toast-container');
    expect(container).toBeInTheDocument();
    expect(container.getAttribute('position')).toBe('top-center');
    expect(container.getAttribute('limit')).toBe('1');
    expect(container.getAttribute('autoClose')).toBe('5000');
    expect(container.getAttribute('containerId')).toBe('toast');
    expect(container.getAttribute('pauseOnFocusLoss')).toBeFalsy();
  });
});

describe('PegaseAlertContainer', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render PegaseAlertContainer with the proper props', () => {
    const { getByTestId } = render(<PegaseAlertContainer />);
    const container = getByTestId('toast-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('!bottom-8');
    expect(container).toHaveStyle({ width: '600px' });
    expect(container.getAttribute('position')).toBe('bottom-right');
    expect(container.getAttribute('limit')).toBe('50');
    expect(container.getAttribute('autoClose')).toBeFalsy();
    expect(container.getAttribute('containerId')).toBe('alert');
    expect(container.getAttribute('closeOnClick')).toBeFalsy();
  });
});
