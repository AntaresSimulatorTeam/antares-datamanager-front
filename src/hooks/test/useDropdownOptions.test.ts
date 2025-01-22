/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook } from '@testing-library/react';
import { NO_WRAP_CLASS, useDropdownOptions } from '@/hooks/useDropdownOptions';
import { describe, expectTypeOf, it } from 'vitest';
import { RdsDropdownOption, RdsIconId } from 'rte-design-system-react';

describe('useDropdownOptions', () => {
  const mockOnClick = vi.fn();

  it('should return settingOption, deleteOption and pinOption functions', () => {
    const { result } = renderHook(() => useDropdownOptions());

    expectTypeOf(result.current.settingOption).toBeFunction();
    expectTypeOf(result.current.settingOption).returns.toEqualTypeOf(RdsDropdownOption);
    expectTypeOf(result.current.deleteOption).toBeFunction();
    expectTypeOf(result.current.deleteOption).returns.toEqualTypeOf(RdsDropdownOption);
    expectTypeOf(result.current.pinOption).toBeFunction();
    expectTypeOf(result.current.pinOption).returns.toEqualTypeOf(RdsDropdownOption);
  });

  it('should call settingOption and return the right set of options', () => {
    const { result } = renderHook(() => useDropdownOptions());
    const settingOptions = {
      key: 'setting',
      label: 'Setting',
      value: 'setting',
      onItemClick: mockOnClick,
      disabled: undefined,
      icon: RdsIconId.Settings,
      extraClasses: NO_WRAP_CLASS,
    } as RdsDropdownOption;

    expect(result.current.settingOption(mockOnClick)).toEqual(settingOptions);
    expect(result.current.settingOption(mockOnClick, 'noSettings')).toEqual({
      key: 'setting',
      label: 'noSettings',
      value: 'setting',
      onItemClick: mockOnClick,
      disabled: undefined,
      icon: RdsIconId.Settings,
      extraClasses: NO_WRAP_CLASS,
    });
    expect(result.current.settingOption(mockOnClick, undefined)).toEqual({
      key: 'setting',
      label: 'Setting',
      value: 'setting',
      onItemClick: mockOnClick,
      disabled: undefined,
      icon: RdsIconId.Settings,
      extraClasses: NO_WRAP_CLASS,
    });
    expect(result.current.settingOption(mockOnClick, 'settings', true)).toEqual({
      key: 'setting',
      label: 'settings',
      value: 'setting',
      onItemClick: mockOnClick,
      disabled: true,
      icon: RdsIconId.Settings,
      extraClasses: NO_WRAP_CLASS,
    });
  });

  it('should call deleteOption and return the right set of options', () => {
    const { result } = renderHook(() => useDropdownOptions());
    const classes = 'whitespace-nowrap [&]:text-error-600 [&]:hover:text-error-600';

    const deleteOptions = {
      key: 'delete',
      label: 'Delete',
      value: 'delete',
      onItemClick: mockOnClick,
      disabled: undefined,
      icon: RdsIconId.Delete,
      extraClasses: classes,
    } as RdsDropdownOption;

    expect(result.current.deleteOption(mockOnClick)).toEqual(deleteOptions);
    expect(result.current.deleteOption(mockOnClick, 'deleteLabel')).toEqual({
      key: 'delete',
      label: 'deleteLabel',
      value: 'delete',
      onItemClick: mockOnClick,
      disabled: undefined,
      icon: RdsIconId.Delete,
      extraClasses: classes,
    } as RdsDropdownOption);
    expect(result.current.deleteOption(mockOnClick, undefined, false)).toEqual({
      key: 'delete',
      label: 'Delete',
      value: 'delete',
      onItemClick: mockOnClick,
      disabled: false,
      icon: RdsIconId.Delete,
      extraClasses: classes,
    } as RdsDropdownOption);
  });

  it('should call pinOption and return the right set of options', () => {
    const { result } = renderHook(() => useDropdownOptions());
    const pinOptions = {
      key: 'pin',
      label: 'Unpin',
      value: 'pin',
      onItemClick: mockOnClick,
      icon: RdsIconId.KeepOff,
      extraClasses: NO_WRAP_CLASS,
    } as RdsDropdownOption;

    expect(result.current.pinOption(true, mockOnClick)).toEqual(pinOptions);
    expect(result.current.pinOption(false, mockOnClick)).toEqual({
      key: 'pin',
      label: 'Pin',
      value: 'pin',
      onItemClick: mockOnClick,
      icon: RdsIconId.PushPin,
      extraClasses: NO_WRAP_CLASS,
    } as RdsDropdownOption);
  });
});
