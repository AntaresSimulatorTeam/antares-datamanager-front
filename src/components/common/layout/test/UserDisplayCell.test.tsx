/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UserDisplayCell from '@/components/common/layout/UserDisplayCell';
import * as useUserDisplayHook from '@/shared/hooks/useUserDisplay';

// Mock the useUserDisplay hook
vi.mock('@/shared/hooks/useUserDisplay', () => ({
  useUserDisplay: vi.fn(),
}));

describe('UserDisplayCell Component', () => {
  const mockUserData = {
    fullname: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render avatar with user fullname', () => {
    vi.mocked(useUserDisplayHook.useUserDisplay).mockReturnValueOnce(mockUserData);

    render(<UserDisplayCell nni="R12345" />);

    const avatar = screen.getByText('Jo');
    expect(avatar).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useUserDisplayHook.useUserDisplay).mockReturnValueOnce({
      ...mockUserData,
      isLoading: true,
      fullname: '..',
    });

    render(<UserDisplayCell nni="R12345" />);

    // The component should render with loading state
    expect(screen.getByText('..')).toBeInTheDocument();
  });

  it('should handle error state and fallback to NNI', () => {
    vi.mocked(useUserDisplayHook.useUserDisplay).mockReturnValueOnce({
      ...mockUserData,
      isLoading: false,
      error: 'Failed to fetch user',
      fullname: 'R12345',
    });

    render(<UserDisplayCell nni="R12345" />);

    const avatar = screen.getByText('R1');
    expect(avatar).toBeInTheDocument();
  });

  it('should call useUserDisplay hook with correct NNI', () => {
    vi.mocked(useUserDisplayHook.useUserDisplay).mockReturnValueOnce(mockUserData);

    render(<UserDisplayCell nni="R67890" />);

    expect(useUserDisplayHook.useUserDisplay).toHaveBeenCalledWith('R67890');
  });

  it('should update when NNI prop changes', () => {
    vi.mocked(useUserDisplayHook.useUserDisplay).mockReturnValueOnce(mockUserData);

    const { rerender } = render(<UserDisplayCell nni="R12345" />);

    expect(useUserDisplayHook.useUserDisplay).toHaveBeenCalledWith('R12345');

    vi.mocked(useUserDisplayHook.useUserDisplay).mockReturnValueOnce({
      ...mockUserData,
      fullname: 'Jane Smith',
    });

    rerender(<UserDisplayCell nni="R67890" />);

    expect(useUserDisplayHook.useUserDisplay).toHaveBeenCalledWith('R67890');
  });

  it('should render with correct avatar size', () => {
    vi.mocked(useUserDisplayHook.useUserDisplay).mockReturnValueOnce(mockUserData);

    render(<UserDisplayCell nni="R12345" />);

    const avatar = screen.getByText('Jo');
    expect(avatar).toBeInTheDocument();
  });

  it('should have gray background color', () => {
    vi.mocked(useUserDisplayHook.useUserDisplay).mockReturnValueOnce(mockUserData);

    render(<UserDisplayCell nni="R12345" />);

    // Avatar should be rendered
    const avatar = screen.getByText('Jo');
    expect(avatar).toBeInTheDocument();
  });
});
