import { describe, expect, it } from 'vitest';
import { avatarCase, convertToOneYearHorizon, sentenceCase } from '@/shared/utils/textUtils.ts';

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

describe('convertToOneYearHorizon', () => {
  it('retourne la plus grande année parmi plusieurs années', () => {
    const input = '2020-2023';
    const result = convertToOneYearHorizon(input);
    expect(result).toBe('2023');
  });

  it('retourne la seule année si une seule est présente', () => {
    const input = 'Année 2022';
    const result = convertToOneYearHorizon(input);
    expect(result).toBe('2022');
  });

  it('retourne la plus grande année dans une chaîne complexe', () => {
    const input = 'de 2018 à 2021 puis 2020';
    const result = convertToOneYearHorizon(input);
    expect(result).toBe('2021');
  });

  it('retourne une chaîne vide si aucune année trouvée', () => {
    const input = 'aucune année ici';
    const result = convertToOneYearHorizon(input);
    expect(result).toBe('');
  });

  it('gère une chaîne vide', () => {
    const result = convertToOneYearHorizon('');
    expect(result).toBe('');
  });

  it('ignore les nombres qui ne sont pas au format année (4 chiffres)', () => {
    const input = '12 123 12345 2024';
    const result = convertToOneYearHorizon(input);
    expect(result).toBe('2024');
  });
});
