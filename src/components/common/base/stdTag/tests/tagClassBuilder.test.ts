import { COLOR_CLASSES, COMMON_CLASSES, LABEL_CLASSES, UTILITY_CLASSES, tagClassBuilder } from '../tagClassBuilder';

describe('tagClassBuilder function', () => {
  it('should have the common and label classes', () => {
    expect(tagClassBuilder('primary').containerClasses.includes(COMMON_CLASSES)).toBe(true);
    expect(tagClassBuilder('primary').containerClasses.includes(UTILITY_CLASSES)).toBe(true);
    expect(tagClassBuilder('primary').labelClasses.includes(LABEL_CLASSES)).toBe(true);
  });

  it('should have the correct padding classes', () => {
    expect(tagClassBuilder('primary').containerClasses.includes('px-0.5')).toBe(true);
    expect(tagClassBuilder('primary', true).containerClasses.includes('pl-0.5')).toBe(true);
  });

  it('should have the right color classes', () => {
    expect(tagClassBuilder('primary').containerClasses.includes(COLOR_CLASSES.primary)).toBe(true);
    expect(tagClassBuilder('danger').containerClasses.includes(COLOR_CLASSES.danger)).toBe(true);
    expect(tagClassBuilder('info').containerClasses.includes(COLOR_CLASSES.info)).toBe(true);
    expect(tagClassBuilder('neutral').containerClasses.includes(COLOR_CLASSES.neutral)).toBe(true);
    expect(tagClassBuilder('secondary').containerClasses.includes(COLOR_CLASSES.secondary)).toBe(true);
    expect(tagClassBuilder('success').containerClasses.includes(COLOR_CLASSES.success)).toBe(true);
  });
});
