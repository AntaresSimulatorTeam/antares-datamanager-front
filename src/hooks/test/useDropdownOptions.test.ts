/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook } from '@testing-library/react';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { describe, expectTypeOf, it } from 'vitest';
import { DropdownItemProps } from '@design-system-rte/core/components/dropdown/dropdown.interface';

describe('useDropdownOptions', () => {
  const mockOnClick = vi.fn();

  it('should return editOption, deleteOption and pinOption functions', () => {
    const { result } = renderHook(() => useDropdownOptions());

    expectTypeOf(result.current.editOption).toBeFunction();
    expectTypeOf(result.current.editOption).returns.toEqualTypeOf<DropdownItemProps>();
    expectTypeOf(result.current.deleteOption).toBeFunction();
    expectTypeOf(result.current.deleteOption).returns.toEqualTypeOf<DropdownItemProps>();
    expectTypeOf(result.current.pinOption).toBeFunction();
    expectTypeOf(result.current.pinOption).returns.toEqualTypeOf<DropdownItemProps>();
  });

  it('should call editOption and return the right set of options', () => {
    const { result } = renderHook(() => useDropdownOptions());
    const settingOptions = {
      label: 'Edit',
      onClick: mockOnClick,
      disabled: undefined,
      leftIcon: 'edit',
    };

    expect(result.current.editOption(mockOnClick)).toEqual(settingOptions);
    expect(result.current.editOption(mockOnClick, 'noSettings')).toEqual({
      label: 'noSettings',
      onClick: mockOnClick,
      disabled: undefined,
      leftIcon: 'edit',
    });
    expect(result.current.editOption(mockOnClick)).toEqual({
      label: 'Edit',
      onClick: mockOnClick,
      disabled: undefined,
      leftIcon: 'edit',
    });
    expect(result.current.editOption(mockOnClick, 'Edit', true)).toEqual({
      label: 'Edit',
      onClick: mockOnClick,
      disabled: true,
      leftIcon: 'edit',
    });
  });

  it('should call deleteOption and return the right set of options', () => {
    const { result } = renderHook(() => useDropdownOptions());

    const deleteOptions = {
      label: 'Delete',
      onClick: mockOnClick,
      disabled: undefined,
      leftIcon: 'delete',
    };

    expect(result.current.deleteOption(mockOnClick)).toEqual(deleteOptions);
    expect(result.current.deleteOption(mockOnClick, 'deleteLabel')).toEqual({
      label: 'deleteLabel',
      onClick: mockOnClick,
      disabled: undefined,
      leftIcon: 'delete',
    });
    expect(result.current.deleteOption(mockOnClick, undefined, false)).toEqual({
      label: 'Delete',
      onClick: mockOnClick,
      disabled: false,
      leftIcon: 'delete',
    });
  });

  it('should call deleteOption and onClickItem is undefined if option is disabled', () => {
    const { result } = renderHook(() => useDropdownOptions());

    const deleteOptions = {
      label: 'Delete',
      onClick: undefined,
      disabled: true,
      leftIcon: 'delete',
    };

    expect(result.current.deleteOption(mockOnClick, 'Delete', true)).toEqual(deleteOptions);
    expect(result.current.deleteOption(mockOnClick, 'deleteLabel', true)).toEqual({
      label: 'deleteLabel',
      onClick: undefined,
      disabled: true,
      leftIcon: 'delete',
    });
    expect(result.current.deleteOption(mockOnClick, undefined, true)).toEqual({
      label: 'Delete',
      onClick: undefined,
      disabled: true,
      leftIcon: 'delete',
    });
  });

  it('should call pinOption and return the right set of options', () => {
    const { result } = renderHook(() => useDropdownOptions());
    const pinOptions = {
      label: 'Unpin',
      onClick: mockOnClick,
      leftIcon: 'keep-off',
    };

    expect(result.current.pinOption(true, mockOnClick)).toEqual(pinOptions);
    expect(result.current.pinOption(false, mockOnClick)).toEqual({
      label: 'Pin',
      onClick: mockOnClick,
      leftIcon: 'keep',
    });
  });

  it('should call pinOption and onClickItem is undefined if option is disabled', () => {
    const { result } = renderHook(() => useDropdownOptions());
    const pinOptions = {
      label: 'Unpin',
      onClick: undefined,
      disabled: true,
      leftIcon: 'keep-off',
    };

    expect(result.current.pinOption(true, mockOnClick, true)).toEqual(pinOptions);
    expect(result.current.pinOption(false, mockOnClick, true)).toEqual({
      label: 'Pin',
      disabled: true,
      onClick: undefined,
      leftIcon: 'keep',
    });
  });
});
