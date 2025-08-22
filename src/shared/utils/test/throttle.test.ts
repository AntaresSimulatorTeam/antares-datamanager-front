import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle } from '../throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // vitest starts performance timer at 0, advance to a realistic tick.
    vi.advanceTimersByTime(10000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute the function immediately on first call', () => {
    const mockFn = vi.fn();
    const { throttled } = throttle(mockFn, 100);

    throttled('test');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should not execute again if called within the limit time', () => {
    const mockFn = vi.fn();
    const { throttled } = throttle(mockFn, 100);

    throttled('first call');
    throttled('ignored call');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('first call');
  });

  it('should execute the latest call after the limit time', () => {
    const mockFn = vi.fn();
    const { throttled } = throttle(mockFn, 100);

    throttled('first call');
    throttled('will be called later');

    expect(mockFn).toHaveBeenCalledTimes(1);

    // Fast-forward time
    vi.advanceTimersByTime(101);

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith('will be called later');
  });

  it('should execute immediately after the limit time has passed', () => {
    const mockFn = vi.fn();
    const { throttled } = throttle(mockFn, 100);

    throttled('first call');
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Fast-forward time
    vi.advanceTimersByTime(101);

    throttled('second call');
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith('second call');
  });

  it('should schedule only one delayed call even if called multiple times', () => {
    const mockFn = vi.fn();
    const { throttled } = throttle(mockFn, 100);

    throttled('first call');
    throttled('ignored');
    throttled('also ignored');
    throttled('will be called later');

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(101);

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith('will be called later');
  });

  it('should cancel pending execution when cancel is called', () => {
    const mockFn = vi.fn();
    const { throttled, cancel } = throttle(mockFn, 100);

    throttled('first call');
    throttled('should be canceled');

    expect(mockFn).toHaveBeenCalledTimes(1);

    cancel();

    vi.advanceTimersByTime(101);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).not.toHaveBeenCalledWith('should be canceled');
  });

  it('should handle multiple arguments correctly', () => {
    const mockFn = vi.fn();
    const { throttled } = throttle(mockFn, 100);

    throttled('arg1', 'arg2', 123);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('should work with async functions', () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('result');
    const { throttled } = throttle(mockAsyncFn, 100);

    throttled('async call');

    expect(mockAsyncFn).toHaveBeenCalledTimes(1);
    expect(mockAsyncFn).toHaveBeenCalledWith('async call');
  });
});
