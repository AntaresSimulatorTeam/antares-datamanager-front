/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render, screen } from '@testing-library/react';
import StdTagList from '../StdTagList';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

const TEST_TAGS_LIST = [
  'Value 1',
  'Value 2',
  'Value 3',
  'Value 4',
  'Value 5',
  'Value 6',
  'Value 7',
  'Value 8',
  'Value 9',
];

const TEST_ID = 'test-tag-list-id';

describe('StdTagList', () => {
  it('renders the default StdTagList with the expected tags', () => {
    render(<StdTagList id={TEST_ID} tags={TEST_TAGS_LIST} />);
    expect(screen.getAllByRole('listitem').length).toBe(TEST_TAGS_LIST.length);
  });

  it('renders the default StdTagList with the icon tags', () => {
    render(<StdTagList id={TEST_ID} tags={TEST_TAGS_LIST} icon={StdIconId.Sell} />);
    expect(screen.getByTitle(StdIconId.Sell)).toBeInTheDocument();
  });
});
