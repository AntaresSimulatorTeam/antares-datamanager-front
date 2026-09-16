import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import StdTagList from '../StdTagList';

const TEST_TAGS_LIST = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange', 'Pink'];

// Mock resize observer
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
global.ResizeObserver = mockResizeObserver;

// Helper to mock getBoundingClientRect
const mockElementDimensions = (width: number) => {
  // Mock element dimensions for container
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    value: width,
  });

  // Mock getBoundingClientRect for tags
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
  HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 60,
    height: 28,
    top: 0,
    left: 0,
    right: 60,
    bottom: 28,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));

  return () => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StdTagList', () => {
  it('renders all tags when autoExpands is true', () => {
    render(<StdTagList tags={TEST_TAGS_LIST} autoExpands={true} startReady={true} />);

    // All tags should be visible
    TEST_TAGS_LIST.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });

    // No "+" button should be visible
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('limits displayed tags when container is too small', async () => {
    // Mock narrow container
    const cleanup = mockElementDimensions(20);

    render(<StdTagList tags={TEST_TAGS_LIST} startReady={true} />);

    // Not all tags should be visible, and a "+" button should appear
    // Force the resize calculation
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      const plusButton = screen.getByRole('button', { name: /^\+/ });
      expect(plusButton).toBeInTheDocument();
    });

    cleanup();
  });

  it('shows dropdown when plus tag is clicked', async () => {
    const cleanup = mockElementDimensions(20);
    const user = userEvent.setup();

    render(<StdTagList tags={TEST_TAGS_LIST} startReady={true} id="test-taglist" />);

    // Force the resize calculation
    fireEvent(window, new Event('resize'));

    // Find and click the "+" button
    await waitFor(() => {
      const plusButton = screen.getByRole('button', { name: /^\+/ });
      expect(plusButton).toBeInTheDocument();
      return plusButton;
    }).then(async (plusButton) => {
      await user.click(plusButton);

      // Popover should be visible with remaining tags
      const dropdown = screen.getByRole('dropdown');
      expect(dropdown).toBeInTheDocument();

      // Close button should work
      const closeButton = screen.getByText('Close');
      expect(closeButton).toBeEnabled();
      expect(closeButton).toBeVisible();
      fireEvent.click(closeButton);

      // Popover should close
      await waitFor(() => {
        expect(screen.queryByRole('dropdown')).not.toBeInTheDocument();
      });
    });

    cleanup();
  });

  it('respects the maxVisibleTags prop', async () => {
    const maxVisibleTags = 2;
    const cleanup = mockElementDimensions(200);

    render(<StdTagList tags={TEST_TAGS_LIST} maxVisibleTags={maxVisibleTags} startReady={true} />);

    // Force the resize calculation
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      const plusButton = screen.getByRole('button', { name: /^\+/ });
      expect(plusButton).toBeInTheDocument();
      // The text should show the number of hidden tags
      expect(plusButton).toHaveTextContent(`+ ${TEST_TAGS_LIST.length - maxVisibleTags}`);
    });
    cleanup();
  });

  it('renders in single line mode correctly', () => {
    render(<StdTagList tags={TEST_TAGS_LIST} singleLine={true} startReady={true} />);

    // The container should have the single line class
    const container = screen.getByRole('list');
    expect(container).toHaveClass('h-3');
    expect(container).toHaveClass('overflow-y-hidden');
  });

  it('handles empty tag list gracefully', () => {
    render(<StdTagList tags={[]} startReady={true} />);

    // No tags should be visible
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    // No plus button should be visible
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});
