/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StudyTable from './StudyTable';
import { describe, it, expect } from 'vitest';

describe('StudyTable Component', () => {
  it('renders the search input and table display', async () => {
    render(<StudyTable />);

    // Check if the search input is rendered
    const searchInput = screen.getByPlaceholderText('Search');
    expect(searchInput).toBeInTheDocument();
  });
});
