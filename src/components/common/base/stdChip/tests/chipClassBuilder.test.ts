/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MouseEventHandler } from 'react';
import { ChipStatus } from '../StdChip';
import {
  ACTIVE_CLASSES,
  ACTIVE_KEYBOARD_CLASSES,
  COMMON_CLASSES,
  PADDING_X,
  STATUS_CLASSES,
  chipClassBuilder,
} from '../chipClassBuilder';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { noop } from '@/shared/utils/common/defaultUtils';

const defaultConf = {
  status: 'primary',
  isActive: false,
  label: 'text',
  icon: StdIconId.Add,
  onClick: noop,
  onClose: undefined,
} as {
  status: ChipStatus;
  isActive: boolean;
  label?: string;
  icon?: StdIconId;
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  onClose?: MouseEventHandler<HTMLButtonElement>;
};

const generateClasses = (input: typeof defaultConf) =>
  chipClassBuilder(input.status, input.isActive, input.label, input.icon, input.onClick, input.onClose);

describe('generateClasses function', () => {
  it('should have the common classes', () => {
    expect(generateClasses(defaultConf).chipClasses.includes(COMMON_CLASSES)).toBe(true);
  });
  it('should have the proper variant and type classes', () => {
    expect(generateClasses(defaultConf).chipClasses.includes(STATUS_CLASSES.primary)).toBe(true);
    expect(
      generateClasses({ ...defaultConf, status: 'secondary' }).chipClasses.includes(STATUS_CLASSES.secondary),
    ).toBe(true);
    expect(
      generateClasses({ ...defaultConf, status: 'success', onClose: noop }).chipClasses.includes(
        STATUS_CLASSES.success,
      ),
    ).toBe(true);
    expect(
      generateClasses({ ...defaultConf, status: 'error', onClose: noop }).chipClasses.includes(STATUS_CLASSES.error),
    ).toBe(true);
    expect(
      generateClasses({ status: 'primary', isActive: false, label: 'text' }).chipClasses.includes(
        PADDING_X.paddingDefault,
      ),
    ).toBe(true);
    expect(
      generateClasses({ ...defaultConf, onClose: noop, icon: undefined }).chipClasses.includes(
        PADDING_X.paddingRightWithCloseButton,
      ),
    ).toBe(true);
    expect(generateClasses(defaultConf).chipClasses.includes(PADDING_X.paddingLeftWithIcon)).toBe(true);
    expect(generateClasses(defaultConf).chipClasses.includes(ACTIVE_CLASSES.primary)).toBe(true);
    expect(
      generateClasses({ ...defaultConf, status: 'secondary' }).chipClasses.includes(ACTIVE_CLASSES.secondary),
    ).toBe(true);
    expect(generateClasses({ ...defaultConf, status: 'success' }).chipClasses.includes(ACTIVE_CLASSES.success)).toBe(
      true,
    );
    expect(generateClasses({ ...defaultConf, status: 'error' }).chipClasses.includes(ACTIVE_CLASSES.error)).toBe(true);
  });
  it('should have the active keyboard classes', () => {
    expect(
      generateClasses({ ...defaultConf, isActive: true }).chipClasses.includes(ACTIVE_KEYBOARD_CLASSES.primary),
    ).toBe(true);
    expect(
      generateClasses({ ...defaultConf, isActive: true, status: 'secondary' }).chipClasses.includes(
        ACTIVE_KEYBOARD_CLASSES.secondary,
      ),
    ).toBe(true);
    expect(
      generateClasses({ ...defaultConf, isActive: true, status: 'success' }).chipClasses.includes(
        ACTIVE_KEYBOARD_CLASSES.success,
      ),
    ).toBe(true);
    expect(
      generateClasses({ ...defaultConf, isActive: true, status: 'error' }).chipClasses.includes(
        ACTIVE_KEYBOARD_CLASSES.error,
      ),
    ).toBe(true);
  });
  it("shouldn't have the active keyboard classes", () => {
    expect(generateClasses(defaultConf).chipClasses.includes(ACTIVE_KEYBOARD_CLASSES.primary)).toBe(false);
    expect(
      generateClasses({ ...defaultConf, status: 'secondary' }).chipClasses.includes(ACTIVE_KEYBOARD_CLASSES.secondary),
    ).toBe(false);
    expect(
      generateClasses({ ...defaultConf, status: 'success' }).chipClasses.includes(ACTIVE_KEYBOARD_CLASSES.success),
    ).toBe(false);
    expect(
      generateClasses({ ...defaultConf, status: 'error' }).chipClasses.includes(ACTIVE_KEYBOARD_CLASSES.error),
    ).toBe(false);
  });
});
