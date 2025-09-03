import { renderHook } from '@testing-library/react';
import { useCallOnResize } from '../useCallOnResize';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('useCallOnResize', () => {
  it('callback should be called when scren size change', async () => {
    const mock = vi.fn();
    renderHook(() => useCallOnResize(mock));
    global.dispatchEvent(new Event('resize'));
    await vi.waitFor(() => expect(mock).toBeCalled());
  });
});
