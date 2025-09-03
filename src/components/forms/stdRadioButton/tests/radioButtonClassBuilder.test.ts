import radioButtonClassBuilder, {
  COMMON_CONTAINER_CLASSES,
  COMMON_LABEL_CONTAINER_CLASSES,
  COMMON_TEXT_CLASSES,
  DISABLED_BORDER_CLASSES,
  DISABLED_CHECK_CLASSES,
  DISABLED_LABEL_CONTAINER_CLASSES,
  DISABLED_TEXT_CLASSES,
  ENABLED_BORDER_CLASSES,
  ENABLED_CHECK_CLASSES,
  RADIO_CIRCLE_CLASSES,
} from '../radioButtonClassBuilder';

describe('radioButtonClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(radioButtonClassBuilder(false).labelContainerClasses.includes(COMMON_LABEL_CONTAINER_CLASSES)).toBe(true);
    expect(radioButtonClassBuilder(false).containerClasses.includes(COMMON_CONTAINER_CLASSES)).toBe(true);
    expect(radioButtonClassBuilder(false).radioCircleClasses.includes(RADIO_CIRCLE_CLASSES)).toBe(true);
    expect(radioButtonClassBuilder(false).textClasses.includes(COMMON_TEXT_CLASSES)).toBe(true);
  });

  it('should have the enabled classes', () => {
    expect(radioButtonClassBuilder(false).containerClasses.includes(ENABLED_BORDER_CLASSES)).toBe(true);
    expect(radioButtonClassBuilder(false).containerClasses.includes(ENABLED_CHECK_CLASSES)).toBe(true);
  });

  it('should have the disabled classes', () => {
    expect(radioButtonClassBuilder(true).labelContainerClasses.includes(DISABLED_LABEL_CONTAINER_CLASSES)).toBe(true);
    expect(radioButtonClassBuilder(true).containerClasses.includes(DISABLED_BORDER_CLASSES)).toBe(true);
    expect(radioButtonClassBuilder(true).containerClasses.includes(DISABLED_CHECK_CLASSES)).toBe(true);
    expect(radioButtonClassBuilder(true).textClasses.includes(DISABLED_TEXT_CLASSES)).toBe(true);
  });
});
