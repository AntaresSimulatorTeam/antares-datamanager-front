/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchUsersByNni } from '@/shared/services/userService';
import { AuthService } from '@/shared/services/authService';

// Mock the authService
vi.mock('@/shared/services/authService', () => ({
  AuthService: {
    authFetch: vi.fn(),
  },
}));

describe('userService - fetchUsersByNni', () => {
  const mockUsers = [
    {
      nni: 'R12345',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
    },
    {
      nni: 'R67890',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch users by NNI and map response correctly', async () => {
    const mockResponse = new Response(JSON.stringify(mockUsers), { status: 200 });
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce(mockResponse);

    const result = await fetchUsersByNni(['R12345', 'R67890']);

    expect(AuthService.authFetch).toHaveBeenCalledWith(expect.stringContaining('/v1/user/list'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['R12345', 'R67890']),
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: '0',
      nni: 'R12345',
      firstName: 'John',
      lastName: 'Doe',
      fullname: 'John Doe',
      email: 'john.doe@example.com',
    });
    expect(result[1]).toEqual({
      id: '1',
      nni: 'R67890',
      firstName: 'Jane',
      lastName: 'Smith',
      fullname: 'Jane Smith',
      email: 'jane.smith@example.com',
    });
  });

  it('should handle empty NNI list', async () => {
    const mockResponse = new Response(JSON.stringify([]), { status: 200 });
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce(mockResponse);

    const result = await fetchUsersByNni([]);

    expect(result).toHaveLength(0);
  });

  it('should throw error when API call fails', async () => {
    const errorMessage = 'API Error';
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce(new Error(errorMessage));

    await expect(fetchUsersByNni(['R12345'])).rejects.toThrow('Failed to fetch users');
  });

  it('should throw error with backend error message', async () => {
    const backendError = {
      antaresErrorMessage: 'User not found',
    };
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce(backendError);

    await expect(fetchUsersByNni(['R12345'])).rejects.toThrow('Failed to fetch users: User not found');
  });

  it('should convert API response with snake_case to camelCase', async () => {
    const mockResponse = new Response(
      JSON.stringify([
        {
          nni: 'R11111',
          first_name: 'Alice',
          last_name: 'Johnson',
          email: 'alice@example.com',
        },
      ]),
      { status: 200 }
    );
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce(mockResponse);

    const result = await fetchUsersByNni(['R11111']);

    expect(result[0]).toHaveProperty('firstName', 'Alice');
    expect(result[0]).toHaveProperty('lastName', 'Johnson');
    expect(result[0]).toHaveProperty('fullname', 'Alice Johnson');
  });
});
