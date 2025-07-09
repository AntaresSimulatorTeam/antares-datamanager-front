import { TEST_LOGO_HEADER_CONFIG, TEST_TEXT_HEADER_CONFIG } from '@/mocks/data/testsData/navbarConfig';
import {
  DEFAULT_BACKGROUND_CONFIG,
  DEFAULT_TWO_LETTERS_BACKGROUND,
  NAVBAR_BASE_CLASSES,
  NAVBAR_COLLAPSED_CLASSES,
  NAVBAR_CONTROLLER_BASE_CLASSES,
  NAVBAR_EXPANDED_CLASSES,
  NAVBAR_ITEM_COLLAPSED_CLASSES,
  NAVBAR_ITEM_COMMON_CLASSES,
  navbarClassBuilder,
  navbarControllerClassBuilder,
  navbarHeaderClassBuilder,
  navbarItemClassBuilder,
  TWO_LETTERS_CLASSES,
  VERSIONS_CLASSES,
} from '../navbarClassBuilder';

describe('navbarClassBuilder', () => {
  it('should have the common classes', () => {
    expect(navbarClassBuilder(true)).toContain(NAVBAR_BASE_CLASSES);
    expect(navbarClassBuilder(false)).toContain(NAVBAR_BASE_CLASSES);
  });
  it('should have the default config classes when no config passed', () => {
    const DEFAULT_TEXT = 'text-gray-900';
    const DEFAULT_BG = 'bg-gray-100';
    const DEFAULT_BORDER = 'border-gray-200';
    const res = navbarClassBuilder(true);
    expect(res).toContain(DEFAULT_TEXT);
    expect(res).toContain(DEFAULT_BG);
    expect(res).toContain(DEFAULT_BORDER);
  });
  it('should have the proper expanded classes', () => {
    expect(navbarClassBuilder(true)).toContain(NAVBAR_EXPANDED_CLASSES);
  });
  it('should have the proper collapsed classes', () => {
    expect(navbarClassBuilder(false)).toContain(NAVBAR_COLLAPSED_CLASSES);
  });
});

describe('navbarItemClassBuilder', () => {
  it('should have the common classes', () => {
    expect(navbarItemClassBuilder(true, true)).toContain(NAVBAR_ITEM_COMMON_CLASSES);
    expect(navbarItemClassBuilder(true, false)).toContain(NAVBAR_ITEM_COMMON_CLASSES);
    expect(navbarItemClassBuilder(false, true)).toContain(NAVBAR_ITEM_COMMON_CLASSES);
    expect(navbarItemClassBuilder(false, false)).toContain(NAVBAR_ITEM_COMMON_CLASSES);
  });
  it('should have the collapsed classes if expanded is false', () => {
    expect(navbarItemClassBuilder(true, true)).not.toContain(NAVBAR_ITEM_COLLAPSED_CLASSES);
    expect(navbarItemClassBuilder(true, false)).toContain(NAVBAR_ITEM_COLLAPSED_CLASSES);
  });
  it('should have the default config classes when no config is passed', () => {
    expect(navbarItemClassBuilder(false, true)).toContain(DEFAULT_BACKGROUND_CONFIG.mainBg);
    expect(navbarItemClassBuilder(false, true)).toContain(DEFAULT_BACKGROUND_CONFIG.hoverBg);
    expect(navbarItemClassBuilder(false, true)).toContain(DEFAULT_BACKGROUND_CONFIG.activeBg);
    expect(navbarItemClassBuilder(false, true)).toContain(DEFAULT_BACKGROUND_CONFIG.hoverBg);
    expect(navbarItemClassBuilder(false, true)).toContain(DEFAULT_BACKGROUND_CONFIG.activeBg);
    expect(navbarItemClassBuilder(false, true)).toContain(DEFAULT_BACKGROUND_CONFIG.hoverBg);
  });

  it('should have the default selected classes when no config is passed and selected is true', () => {
    expect(navbarItemClassBuilder(true, true)).toContain(DEFAULT_BACKGROUND_CONFIG.selectedBg);
    expect(navbarItemClassBuilder(true, true)).toContain(DEFAULT_BACKGROUND_CONFIG.selectedBg);
    expect(navbarItemClassBuilder(false, true)).not.toContain(DEFAULT_BACKGROUND_CONFIG.selectedBg);
    expect(navbarItemClassBuilder(false, true)).not.toContain(DEFAULT_BACKGROUND_CONFIG.selectedBg);
  });
});

describe('navbarControllerClassBuilder', () => {
  it('should have the common classes', () => {
    expect(navbarControllerClassBuilder(true)).toContain(NAVBAR_CONTROLLER_BASE_CLASSES);
    expect(navbarControllerClassBuilder(false)).toContain(NAVBAR_CONTROLLER_BASE_CLASSES);
  });
});

describe('navbarHeaderClassBuilder', () => {
  it('should have the two letters class if variant is text', () => {
    expect(navbarHeaderClassBuilder(TEST_TEXT_HEADER_CONFIG).twoLettersClasses).toContain(TWO_LETTERS_CLASSES);
    expect(navbarHeaderClassBuilder(TEST_TEXT_HEADER_CONFIG).twoLettersClasses).toContain(
      DEFAULT_TWO_LETTERS_BACKGROUND,
    );
    expect(navbarHeaderClassBuilder(TEST_TEXT_HEADER_CONFIG).twoLettersClasses).toContain(
      DEFAULT_TWO_LETTERS_BACKGROUND,
    );
  });
  it('should not have any two letters class if variant is logo', () => {
    expect(navbarHeaderClassBuilder(TEST_LOGO_HEADER_CONFIG)).to.not.haveOwnProperty('twoLettersClasses');
  });
  it('should have the proper variant classes', () => {
    expect(navbarHeaderClassBuilder(TEST_TEXT_HEADER_CONFIG).versionClasses).toContain(VERSIONS_CLASSES.text);
    expect(navbarHeaderClassBuilder(TEST_LOGO_HEADER_CONFIG).versionClasses).toContain(VERSIONS_CLASSES.logo);
  });
});
