import { describe, expect, it } from 'vitest';
import { isBackendError, isBusinessError } from '@/shared/utils/errorUtils.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';

describe('isBackendError', () => {
  it('should return true for valid BackendError object', () => {
    const error = {
      type: 'BUSINESS',
      antaresErrorMessage: 'Something went wrong',
    };
    expect(isBackendError(error)).toBe(true);
  });

  it('should return false if type is missing', () => {
    const error = {
      antaresErrorMessage: 'Missing type',
    };
    expect(isBackendError(error)).toBe(false);
  });

  it('should return false if antaresErrorMessage is missing', () => {
    const error = {
      type: 'BUSINESS',
    };
    expect(isBackendError(error)).toBe(false);
  });

  it('should return false if type is not a string', () => {
    const error = {
      type: 123,
      antaresErrorMessage: 'Invalid type',
    };
    expect(isBackendError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBackendError(null)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isBackendError('error')).toBe(false);
    expect(isBackendError(42)).toBe(false);
    expect(isBackendError(true)).toBe(false);
  });

  it('should return false for native Error object', () => {
    const nativeError = new Error('Native error');
    expect(isBackendError(nativeError)).toBe(false);
  });
});

describe('isBusinessError', () => {
  it('should return true for valid BUSINESS BackendError', () => {
    const error = {
      type: ERROR_MESSAGE_TYPE.BUSINESS,
      antaresErrorMessage: 'Business logic failed',
    };
    expect(isBusinessError(error)).toBe(true);
  });

  it('should return false for TECHNICAL BackendError', () => {
    const error = {
      type: ERROR_MESSAGE_TYPE.TECHNICAL,
      antaresErrorMessage: 'Technical issue',
    };
    expect(isBusinessError(error)).toBe(false);
  });

  it('should return false if type is missing', () => {
    const error = {
      antaresErrorMessage: 'Missing type',
    };
    expect(isBusinessError(error)).toBe(false);
  });

  it('should return false if antaresErrorMessage is missing', () => {
    const error = {
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    };
    expect(isBusinessError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBusinessError(null)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isBusinessError('error')).toBe(false);
    expect(isBusinessError(42)).toBe(false);
    expect(isBusinessError(true)).toBe(false);
  });

  it('should return false for native Error object', () => {
    const nativeError = new Error('Native error');
    expect(isBusinessError(nativeError)).toBe(false);
  });
});
