import { describe, expect, it, Mock, vi } from 'vitest';
import { avatarCase, sentenceCase, validateHorizon, validateName } from '@/shared/utils/textUtils.ts';
import { TFunction } from 'i18next';

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

describe('validateName', () => {
  let setNameError: Mock;

  beforeEach(() => {
    setNameError = vi.fn();
    vi.clearAllMocks();
  });

  it('retourne false et définit une erreur si name est une chaîne vide', () => {
    const result = validateName('', setNameError, 'Message d’erreur');

    expect(result).toBe(false);
    expect(setNameError).toHaveBeenCalledWith('Message d’erreur');
  });

  it('retourne false et définit une erreur si name contient uniquement des espaces', () => {
    const result = validateName('   ', setNameError, 'Message d’erreur');

    expect(result).toBe(false);
    expect(setNameError).toHaveBeenCalledWith('Message d’erreur');
  });

  it('retourne true si name est valide', () => {
    const result = validateName('John', setNameError, 'Message d’erreur');

    expect(result).toBe(true);
    expect(setNameError).not.toHaveBeenCalled();
  });

  it('retourne false si name est undefined', () => {
    const result = validateName(undefined as unknown as string, setNameError, 'Message d’erreur');

    expect(result).toBe(false);
    expect(setNameError).toHaveBeenCalledWith('Message d’erreur');
  });
});

describe('validateHorizon', () => {
  let setErrorMessage: Mock;
  const t = vi.fn((key: string) => key) as unknown as TFunction<'translation', undefined>;
  let onChangeValidate: Mock;

  beforeEach(() => {
    setErrorMessage = vi.fn();
    onChangeValidate = vi.fn();
    vi.clearAllMocks();
  });

  it('retourne false si value est vide et requiredField = true', () => {
    const result = validateHorizon(setErrorMessage, t, '', true, onChangeValidate);

    expect(result).toBe(false);
    expect(setErrorMessage).toHaveBeenCalledWith('horizonInput.@requiredHorizon');
    expect(onChangeValidate).toHaveBeenCalledWith(false);
  });

  it('retourne true si value est vide et requiredField = false', () => {
    const result = validateHorizon(setErrorMessage, t, '', false, onChangeValidate);

    expect(result).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith('');
    expect(onChangeValidate).toHaveBeenCalledWith(true);
  });

  it('retourne false si value ne correspond pas au format 4 chiffres', () => {
    const result = validateHorizon(setErrorMessage, t, '20a0', true, onChangeValidate);

    expect(result).toBe(false);
    expect(setErrorMessage).toHaveBeenCalledWith('horizonInput.@validYearError');
    expect(onChangeValidate).toHaveBeenCalledWith(false);
  });

  it('retourne false si value < 2000', () => {
    const result = validateHorizon(setErrorMessage, t, '1999', true, onChangeValidate);

    expect(result).toBe(false);
    expect(setErrorMessage).toHaveBeenCalledWith('horizonInput.@validYearError');
    expect(onChangeValidate).toHaveBeenCalledWith(false);
  });

  it('retourne false si value > 9999', () => {
    const result = validateHorizon(setErrorMessage, t, '10000', true, onChangeValidate);

    expect(result).toBe(false);
    expect(setErrorMessage).toHaveBeenCalledWith('horizonInput.@validYearError');
    expect(onChangeValidate).toHaveBeenCalledWith(false);
  });

  it('retourne true si value est un nombre valide entre 2000 et 9999', () => {
    const result = validateHorizon(setErrorMessage, t, '2025', true, onChangeValidate);

    expect(result).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith('');
    expect(onChangeValidate).toHaveBeenCalledWith(true);
  });

  it('trim correctement la valeur avant validation', () => {
    const result = validateHorizon(setErrorMessage, t, '   2024   ', true, onChangeValidate);

    expect(result).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith('');
    expect(onChangeValidate).toHaveBeenCalledWith(true);
  });

  it('ne plante pas si onChangeValidate est undefined', () => {
    const result = validateHorizon(setErrorMessage, t, '2024', true);

    expect(result).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith('');
  });
});

describe('validateName', () => {
  let setNameError: Mock;

  beforeEach(() => {
    setNameError = vi.fn();
    vi.clearAllMocks();
  });

  it('retourne false et définit une erreur si name est une chaîne vide', () => {
    const result = validateName('', setNameError, 'Message d’erreur');

    expect(result).toBe(false);
    expect(setNameError).toHaveBeenCalledWith('Message d’erreur');
  });

  it('retourne false et définit une erreur si name contient uniquement des espaces', () => {
    const result = validateName('   ', setNameError, 'Message d’erreur');

    expect(result).toBe(false);
    expect(setNameError).toHaveBeenCalledWith('Message d’erreur');
  });

  it('retourne true si name est valide', () => {
    const result = validateName('John', setNameError, 'Message d’erreur');

    expect(result).toBe(true);
    expect(setNameError).not.toHaveBeenCalled();
  });

  it('retourne false si name est undefined', () => {
    const result = validateName(undefined as unknown as string, setNameError, 'Message d’erreur');

    expect(result).toBe(false);
    expect(setNameError).toHaveBeenCalledWith('Message d’erreur');
  });
});

describe('validateHorizon', () => {
  let setErrorMessage: Mock;
  const t = vi.fn((key: string) => key) as unknown as TFunction<'translation', undefined>;
  let onChangeValidate: Mock;

  beforeEach(() => {
    setErrorMessage = vi.fn();
    onChangeValidate = vi.fn();
    vi.clearAllMocks();
  });

  it('retourne false si value est vide et requiredField = true', () => {
    const result = validateHorizon(setErrorMessage, t, '', true, onChangeValidate);

    expect(result).toBe(false);
    expect(setErrorMessage).toHaveBeenCalledWith('horizonInput.@requiredHorizon');
    expect(onChangeValidate).toHaveBeenCalledWith(false);
  });

  it('retourne true si value est vide et requiredField = false', () => {
    const result = validateHorizon(setErrorMessage, t, '', false, onChangeValidate);

    expect(result).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith('');
    expect(onChangeValidate).toHaveBeenCalledWith(true);
  });

  it('retourne false si value ne correspond pas au format 4 chiffres', () => {
    const result = validateHorizon(setErrorMessage, t, '20a0', true, onChangeValidate);

    expect(result).toBe(false);
    expect(setErrorMessage).toHaveBeenCalledWith('horizonInput.@validYearError');
    expect(onChangeValidate).toHaveBeenCalledWith(false);
  });

  it('retourne false si value < 2000', () => {
    const result = validateHorizon(setErrorMessage, t, '1999', true, onChangeValidate);

    expect(result).toBe(false);
    expect(setErrorMessage).toHaveBeenCalledWith('horizonInput.@validYearError');
    expect(onChangeValidate).toHaveBeenCalledWith(false);
  });

  it('retourne false si value > 9999', () => {
    const result = validateHorizon(setErrorMessage, t, '10000', true, onChangeValidate);

    expect(result).toBe(false);
    expect(setErrorMessage).toHaveBeenCalledWith('horizonInput.@validYearError');
    expect(onChangeValidate).toHaveBeenCalledWith(false);
  });

  it('retourne true si value est un nombre valide entre 2000 et 9999', () => {
    const result = validateHorizon(setErrorMessage, t, '2025', true, onChangeValidate);

    expect(result).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith('');
    expect(onChangeValidate).toHaveBeenCalledWith(true);
  });

  it('trim correctement la valeur avant validation', () => {
    const result = validateHorizon(setErrorMessage, t, '   2024   ', true, onChangeValidate);

    expect(result).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith('');
    expect(onChangeValidate).toHaveBeenCalledWith(true);
  });

  it('ne plante pas si onChangeValidate est undefined', () => {
    const result = validateHorizon(setErrorMessage, t, '2024', true);

    expect(result).toBe(true);
    expect(setErrorMessage).toHaveBeenCalledWith('');
  });
});
