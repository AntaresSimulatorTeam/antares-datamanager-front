import { COMMON_TAG_LIST_CLASSES, tagListClassBuilder } from '../tagListClassBuilder';

describe('tagListClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(tagListClassBuilder(false, false).tagListClasses.includes(COMMON_TAG_LIST_CLASSES)).toBe(true);
    expect(tagListClassBuilder(true, false).tagListClasses.includes(COMMON_TAG_LIST_CLASSES)).toBe(true);
  });
  it('should have the invisible class before final render', () => {
    expect(tagListClassBuilder(false, false).tagListClasses.includes('invisible')).toBe(true);
  });

  it('should not have the invisible class after final render', () => {
    expect(tagListClassBuilder(true, false).tagListClasses.includes('invisible')).toBe(false);
  });
});
