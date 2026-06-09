import {
  validateFormInputs,
  validateMaxLength,
  validateNameAndHorizonInputs,
} from '@/shared/utils/validateFormInput.ts';
import { Mock, vi } from 'vitest';
import { TFunction } from 'i18next';
import { StudyDTO } from '@/shared/types';
import * as textUtils from '@/shared/utils/textUtils.ts';
import * as arrayUtils from '@/shared/utils/arrayUtils.ts';

describe('validateMaxLength', () => {
  it('retourne true si le texte est plus court que maxLength', () => {
    expect(validateMaxLength('Hello', 10)).toBe(true);
  });

  it('retourne true si le texte est exactement égal à maxLength', () => {
    expect(validateMaxLength('Hello', 5)).toBe(true);
  });

  it('retourne false si le texte dépasse maxLength', () => {
    expect(validateMaxLength('Hello World', 5)).toBe(false);
  });

  it('ignore les espaces en début et fin', () => {
    expect(validateMaxLength('   Hello   ', 5)).toBe(true);
  });

  it('gère une chaîne vide', () => {
    expect(validateMaxLength('', 5)).toBe(true);
  });
});

describe('validNameAndHorizonInputs', () => {
  let setNameError: Mock;
  let setHorizonError: Mock;
  const t = vi.fn((key: string) => key) as unknown as TFunction<'translation', undefined>;

  const mockValidateName = vi.mocked(textUtils.validateName);
  const mockValidateHorizon = vi.mocked(textUtils.validateHorizon);

  beforeEach(() => {
    setNameError = vi.fn();
    setHorizonError = vi.fn();
    vi.clearAllMocks();
  });

  it('retourne true si validateName et validateHorizon sont valides', () => {
    mockValidateName.mockReturnValue(true);
    mockValidateHorizon.mockReturnValue(true);

    const result = validateNameAndHorizonInputs('John', '2025', setNameError, setHorizonError, t);

    expect(result).toBe(true);
  });

  it('retourne false si validateName est invalide', () => {
    mockValidateName.mockReturnValue(false);
    mockValidateHorizon.mockReturnValue(true);

    const result = validateNameAndHorizonInputs('', '2025', setNameError, setHorizonError, t);

    expect(result).toBe(false);
  });

  it('retourne false si validateHorizon est invalide', () => {
    mockValidateName.mockReturnValue(true);
    mockValidateHorizon.mockReturnValue(false);

    const result = validateNameAndHorizonInputs('John', 'abcd', setNameError, setHorizonError, t);

    expect(result).toBe(false);
  });

  it('retourne false si les deux validateurs sont invalides', () => {
    mockValidateName.mockReturnValue(false);
    mockValidateHorizon.mockReturnValue(false);

    const result = validateNameAndHorizonInputs('', '', setNameError, setHorizonError, t);

    expect(result).toBe(false);
  });
});

describe('validateFormInputs', () => {
  vi.mock('@/shared/utils/arrayUtils');
  vi.mock('@/shared/utils/textUtils');

  let setHorizonError: ReturnType<typeof vi.fn>;
  const t = vi.fn((key: string) => key) as unknown as TFunction<'translation', undefined>;

  const mockGetStudyName = vi.mocked(textUtils.getStudyName);
  const mockValidateHorizon = vi.mocked(textUtils.validateHorizon);
  const mockHasArrayChanged = vi.mocked(arrayUtils.hasArrayChanged);

  const study = {
    name: 'Original Study',
    project: 'Original Project',
    keywords: ['a', 'b'],
  } as StudyDTO;

  beforeEach(() => {
    setHorizonError = vi.fn();
    vi.clearAllMocks();
  });

  it('retourne true si isDuplication = true et au moins un champ change', () => {
    mockGetStudyName.mockReturnValue('Original Study');
    mockValidateHorizon.mockReturnValue(true);

    const result = validateFormInputs(true, study, 'New Name', '', ['a', 'b'], '2025', setHorizonError, t);

    expect(result).toBe(true);
  });

  it('retourne true si isDuplication = true et horizon est valide', () => {
    mockGetStudyName.mockReturnValue('Original Study');
    mockValidateHorizon.mockReturnValue(true);

    const result = validateFormInputs(true, study, 'Original Study', '', ['a', 'b'], '2025', setHorizonError, t);

    expect(result).toBe(true);
  });

  it('retourne true si isDuplication = true et projectValue est non vide', () => {
    mockGetStudyName.mockReturnValue('Original Study');
    mockValidateHorizon.mockReturnValue(false);

    const result = validateFormInputs(
      true,
      study,
      'Original Study',
      'New Project',
      ['a', 'b'],
      'invalid',
      setHorizonError,
      t,
    );

    expect(result).toBe(true);
  });

  it('retourne false si isDuplication = true et rien n’a changé et horizon invalide', () => {
    mockGetStudyName.mockReturnValue('Original Study');
    mockValidateHorizon.mockReturnValue(false);

    const result = validateFormInputs(
      true,
      study,
      'Original Study',
      'project',
      ['a', 'b'],
      'invalid',
      setHorizonError,
      t,
    );

    expect(result).toBe(true);
  });

  it('retourne true si isDuplication = false et name a changé', () => {
    mockGetStudyName.mockReturnValue('Original Study');
    mockHasArrayChanged.mockReturnValue(false);

    const result = validateFormInputs(
      false,
      study,
      'New Name',
      'Original Project',
      ['a', 'b'],
      'ignored',
      setHorizonError,
      t,
    );

    expect(result).toBe(true);
  });

  it('retourne true si isDuplication = false et project a changé', () => {
    mockGetStudyName.mockReturnValue('Original Study');
    mockHasArrayChanged.mockReturnValue(false);

    const result = validateFormInputs(
      false,
      study,
      'Original Study',
      'New Project',
      ['a', 'b'],
      'ignored',
      setHorizonError,
      t,
    );

    expect(result).toBe(true);
  });

  it('retourne true si isDuplication = false et keywords ont changé', () => {
    mockGetStudyName.mockReturnValue('Original Study');
    mockHasArrayChanged.mockReturnValue(true);

    const result = validateFormInputs(
      false,
      study,
      'Original Study',
      'Original Project',
      ['x', 'y'],
      'ignored',
      setHorizonError,
      t,
    );

    expect(result).toBe(true);
  });

  it('retourne false si isDuplication = false et rien n’a changé', () => {
    mockGetStudyName.mockReturnValue('Original Study');
    mockHasArrayChanged.mockReturnValue(false);

    const result = validateFormInputs(
      false,
      study,
      'Original Study',
      'Original Project',
      ['a', 'b'],
      'ignored',
      setHorizonError,
      t,
    );

    expect(result).toBe(false);
  });
});
