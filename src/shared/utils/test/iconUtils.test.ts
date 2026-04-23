import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { getStatusIcon } from '@/shared/utils/iconUtils.ts';

describe('getStatusIcon', () => {
  it('retourne l’icône et la couleur pour GENERATED', () => {
    expect(getStatusIcon(StudyStatus.GENERATED)).toEqual({
      icon: 'publish',
      tagStatus: 'success',
    });
  });
  it('retourne l’icône et la couleur pour ERROR', () => {
    expect(getStatusIcon(StudyStatus.ERROR)).toEqual({ icon: 'error', tagStatus: 'alert' });
  });
  it('retourne l’icône et la couleur pour IN_PROGRESS', () => {
    expect(getStatusIcon(StudyStatus.IN_PROGRESS)).toEqual({ icon: 'swap-vert', tagStatus: 'information' });
  });
  it('retourne la valeur par défaut pour un statut inconnu', () => {
    expect(getStatusIcon(StudyStatus.CLOSED)).toEqual({ icon: 'swap-vert', tagStatus: 'information' });
  });
});
