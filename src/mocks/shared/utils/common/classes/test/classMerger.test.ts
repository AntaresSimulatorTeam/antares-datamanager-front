/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from '../classMerger';

describe('classMerger test', () => {
  it('should concat 2 string with space', () => {
    const result = classMerger('str1', 'str2');
    expect(result).toBe('str1 str2');
  });
  it('should concat more than 2 string with space', () => {
    const result = classMerger('str1', 'str2', 'str3', 'str4');
    expect(result).toBe('str1 str2 str3 str4');
  });
  it('should be empty when no parameter', () => {
    const result = classMerger();
    expect(result).toBe('');
  });
});
