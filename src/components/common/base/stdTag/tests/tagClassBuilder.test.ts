import { TAG_CLASSES, UTILITY_CLASSES, tagClassBuilder } from '../tagClassBuilder';

describe('tagClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(tagClassBuilder().includes(TAG_CLASSES)).toBe(true);
    expect(tagClassBuilder().includes(UTILITY_CLASSES)).toBe(true);
  });

  it('should have the correct padding classes', () => {
    expect(tagClassBuilder().includes('px-0.5')).toBe(true);
    expect(tagClassBuilder(true).includes('pl-0.5')).toBe(true);
  });
});
