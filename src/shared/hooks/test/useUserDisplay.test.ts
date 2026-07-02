/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserDisplay } from '@/shared/hooks/useUserDisplay';
import * as userService from '@/shared/services/userService';

// Mock the userService module
vi.mock('@/shared/services/userService', () => ({
  fetchUsersByNni: vi.fn(),
}));

describe('useUserDisplay Hook', () => {
  const mockUser = {
    id: '0',
    nni: 'R12345',
    firstName: 'John',
    lastName: 'Doe',
    fullname: 'John Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with NNI as fullname', () => {
    vi.mocked(userService.fetchUsersByNni).mockResolvedValueOnce([mockUser]);

    const { result } = renderHook(() => useUserDisplay('R12345'));

    // Initially NNI should be set, but isLoading will be true since fetch starts immediately
    expect(result.current.fullname).toBe('R12345');
    expect(result.current.firstName).toBe('');
    expect(result.current.lastName).toBe('');
    // isLoading starts as true when fetch begins
    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch user data and update state', async () => {
    vi.mocked(userService.fetchUsersByNni).mockResolvedValueOnce([mockUser]);

    const { result } = renderHook(() => useUserDisplay('R12345'));

    await waitFor(
      () => {
        expect(result.current.fullname).toBe('John Doe');
      },
      { timeout: 3000 }
    );

    expect(result.current.firstName).toBe('John');
    expect(result.current.lastName).toBe('Doe');
    expect(result.current.error).toBe(null);
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch user';
    const uniqueNni = 'R99999'; // Use unique NNI to avoid cache conflicts
    vi.mocked(userService.fetchUsersByNni).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useUserDisplay(uniqueNni));

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.error).toBe(errorMessage);
    // Should keep the initial NNI if fetch fails
    expect(result.current.fullname).toBe(uniqueNni);
  });

  it('should skip fetching for empty NNI', () => {
    const { result } = renderHook(() => useUserDisplay(''));

    expect(userService.fetchUsersByNni).not.toHaveBeenCalled();
    expect(result.current.fullname).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('should skip fetching for whitespace-only NNI', () => {
    const { result } = renderHook(() => useUserDisplay('   '));

    expect(userService.fetchUsersByNni).not.toHaveBeenCalled();
    expect(result.current.fullname).toBe('   ');
    expect(result.current.isLoading).toBe(false);
  });

  it('should refetch when NNI changes', async () => {
    const mockUser1 = { ...mockUser, nni: 'R11111', fullname: 'John Doe', firstName: 'John', lastName: 'Doe' };
    const mockUser2 = { ...mockUser, nni: 'R22222', fullname: 'Jane Smith', firstName: 'Jane', lastName: 'Smith' };

    vi.mocked(userService.fetchUsersByNni).mockResolvedValueOnce([mockUser1]);

    const { result, rerender } = renderHook(({ nni }) => useUserDisplay(nni), {
      initialProps: { nni: 'R11111' },
    });

    await waitFor(
      () => {
        expect(result.current.fullname).toBe('John Doe');
      },
      { timeout: 3000 }
    );

    vi.mocked(userService.fetchUsersByNni).mockResolvedValueOnce([mockUser2]);

    rerender({ nni: 'R22222' });

    await waitFor(
      () => {
        expect(result.current.fullname).toBe('Jane Smith');
      },
      { timeout: 3000 }
    );
  });

  it('should cache user data to avoid duplicate API calls within same hook instance', async () => {
    vi.mocked(userService.fetchUsersByNni).mockResolvedValue([mockUser]);

    const { result, rerender } = renderHook(({ nni }) => useUserDisplay(nni), {
      initialProps: { nni: 'R12345' },
    });

    await waitFor(
      () => {
        expect(result.current.fullname).toBe('John Doe');
      },
      { timeout: 3000 }
    );

    const callCountAfterFirstFetch = vi.mocked(userService.fetchUsersByNni).mock.calls.length;

    // Re-render with same NNI should not trigger additional fetch
    rerender({ nni: 'R12345' });

    const callCountAfterRerender = vi.mocked(userService.fetchUsersByNni).mock.calls.length;
    expect(callCountAfterRerender).toBe(callCountAfterFirstFetch);
  });

  it('should set isLoading to true during fetch', async () => {
    vi.mocked(userService.fetchUsersByNni).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([mockUser]), 500))
    );

    const { result } = renderHook(() => useUserDisplay('R44444'));

    // Should be loading immediately after hook call
    expect(result.current.isLoading).toBe(true);

    // Wait for it to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );
  });
});
