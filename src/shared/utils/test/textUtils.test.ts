import { describe, expect, it } from 'vitest';
import { avatarCase, sentenceCase } from '@/shared/utils/textUtils.ts';

describe('sentenceCase', () => {
  it('met la première lettre en majuscule et le reste en minuscule', () => {
    expect(sentenceCase('HELLO')).toBe('Hello');
  });

  it('remplace tous les underscores par des espaces', () => {
    expect(sentenceCase('hello_world_test')).toBe('Hello world test');
  });

  it('gère une chaîne déjà en minuscules', () => {
    expect(sentenceCase('hello')).toBe('Hello');
  });

  it('gère une chaîne vide', () => {
    expect(sentenceCase('')).toBe('');
  });

  it('gère une chaîne avec plusieurs underscores consécutifs', () => {
    expect(sentenceCase('hello__world')).toBe('Hello  world');
  });
});

describe('avatarCase', () => {
  it('met la première lettre en majuscule et le reste en minuscule', () => {
    expect(avatarCase('HELLO')).toBe('HE');
  });

  it('gère une chaîne déjà en minuscules', () => {
    expect(avatarCase('hello')).toBe('He');
  });

  it('gère une chaîne avec 1 seul caractère', () => {
    expect(avatarCase('u')).toBe('U');
  });

  it('gère une chaîne vide', () => {
    expect(avatarCase('')).toBe('');
  });
});
