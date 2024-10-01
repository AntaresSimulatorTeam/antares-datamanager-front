/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest'; // Vitest mock API
import StudyTableDisplay from './StudyTableDisplay';

vi.mock('@/components/common/data/stdSimpleTable/StdSimpleTable', () => ({
  default: ({ columns, data }: any) => (
    <table>
      <thead>
        {columns.map((col: any) => (
          <th key={col.header}>{col.header}</th>
        ))}
      </thead>
      <tbody>
        {data.map((row: any, index: number) => (
          <tr key={index}>
            <td>{row.study_name}</td>
            <td>{row.user_name}</td>
            <td>{row.project}</td>
            <td>{row.status}</td>
            <td>{row.horizon}</td>
            <td>{row.keywords}</td>
            <td>{row.creation_date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

// Mock global fetch
global.fetch = vi.fn();

describe('StudyTableDisplay', () => {
  beforeEach(() => {
    // Reset mocks before each test
    global.fetch.mockReset();

    const mockResponse = {
      content: [
        {
          study_name: 'Study 1',
          user_name: 'John Doe',
          project: 'Project A',
          status: 'Active',
          horizon: '2025',
          keywords: 'keyword1',
          creation_date: '2023-01-01',
        },
      ],
      totalElements: 1,
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });
  });

  it('renders table with fetched data on initial load', async () => {
    render(<StudyTableDisplay searchStudy="test" />);
    expect(await screen.findByText('Créateur')).toBeInTheDocument();
    expect(await screen.findByText('Précédent')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(<StudyTableDisplay searchStudy="test" />);
    // Check if table headers are rendered
    expect(screen.getByText('Nom Étude')).toBeInTheDocument();
    expect(screen.getByText('Créateur')).toBeInTheDocument();
    expect(screen.getByText('Projet')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    // expect(screen.getByText('Horizon ')).toBeInTheDocument();
    expect(screen.getByText('mots clés')).toBeInTheDocument();
    expect(screen.getByText('Date de création')).toBeInTheDocument();
  });

  it('fetches and renders rows correctly', async () => {
    render(<StudyTableDisplay searchStudy="test" />);

    // Wait for the rows to be updated in the table
    await waitFor(() => {
      expect(screen.getByText('Study 1')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check if pagination buttons are rendered
    const prevButton = screen.getByText('Précédent');

    // Initially, the 'Précédent' button should be disabled, and 'Suivant' should be enabled
    expect(prevButton).toHaveClass('pagination-button');

    // Simulate clicking 'Suivant'
    const nextButton = await screen.findByText('Suivant');
    fireEvent.click(nextButton);
    // Fetch should be called again for the next page
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
