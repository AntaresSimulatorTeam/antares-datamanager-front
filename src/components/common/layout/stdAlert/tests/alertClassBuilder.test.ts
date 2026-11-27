import {
  alertClassBuilder,
  COMMON_CONTAINER_CLASSES,
  COMMON_TEXT_CLASSES,
  STATUS_COLOR_CLASSES,
  STATUS_CONTAINER_CLASSES,
} from '../alertClassBuilder';

describe('alertClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(alertClassBuilder('info').containerClasses.includes(COMMON_CONTAINER_CLASSES)).toBe(true);
    expect(alertClassBuilder('info').textClasses.includes(COMMON_TEXT_CLASSES)).toBe(true);
  });

  it('should have the proper status classes', () => {
    expect(alertClassBuilder('info').containerClasses.includes(STATUS_CONTAINER_CLASSES.info)).toBe(true);
    expect(alertClassBuilder('warning').containerClasses.includes(STATUS_CONTAINER_CLASSES.warning)).toBe(true);
    expect(alertClassBuilder('error').containerClasses.includes(STATUS_CONTAINER_CLASSES.error)).toBe(true);
    expect(alertClassBuilder('success').containerClasses.includes(STATUS_CONTAINER_CLASSES.success)).toBe(true);
  });

  it('should have the proper status icon classes', () => {
    expect(alertClassBuilder('info').iconClasses.includes(STATUS_COLOR_CLASSES.info)).toBe(true);
    expect(alertClassBuilder('warning').iconClasses.includes(STATUS_COLOR_CLASSES.warning)).toBe(true);
    expect(alertClassBuilder('error').iconClasses.includes(STATUS_COLOR_CLASSES.error)).toBe(true);
    expect(alertClassBuilder('success').iconClasses.includes(STATUS_COLOR_CLASSES.success)).toBe(true);
  });

  it.each([
    [
      'success',
      'border-border-success',
      'text-content-success-default',
      'bg-background-success-default',
      'text-content-primary-inverse',
    ],
    [
      'error',
      'border-border-danger',
      'text-content-danger-default',
      'bg-background-danger-default',
      'text-content-primary-inverse',
    ],
    ['warning', 'border-border-warning', 'text-border-warning', 'bg-background-warning-default', 'text-content-static'],
    [
      'info',
      'border-border-info',
      'text-content-info-default',
      'bg-background-info-default',
      'text-content-primary-inverse',
    ],
  ] as const)('uses design tokens for %s alerts', (status, border, icon, background, foreground) => {
    const regular = alertClassBuilder(status);
    const filled = alertClassBuilder(status, true);

    expect(regular.textClasses).toContain('text-content-primary');
    expect(regular.containerClasses).toContain(border);
    expect(regular.iconClasses).toContain(icon);
    expect(filled.iconClasses).toContain(background);
    expect(filled.iconClasses).toContain(foreground);
  });
});
