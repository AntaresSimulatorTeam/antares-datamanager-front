import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { getStatusIcon } from '@/shared/utils/iconUtils.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

describe('getStatusIcon', () => {
  it('retourne l’icône et la couleur pour GENERATED', () => {
    expect(getStatusIcon(StudyStatus.GENERATED)).toEqual({
      icon: StdIconId.PublishedWithChanges,
      color: 'success-800',
    });
  });
  it('retourne l’icône et la couleur pour ERROR', () => {
    expect(getStatusIcon(StudyStatus.ERROR)).toEqual({ icon: StdIconId.SyncProblem, color: 'error-800' });
  });
  it('retourne l’icône et la couleur pour IN_PROGRESS', () => {
    expect(getStatusIcon(StudyStatus.IN_PROGRESS)).toEqual({ icon: StdIconId.Sync, color: 'info-800' });
  });
  it('retourne la valeur par défaut pour un statut inconnu', () => {
    expect(getStatusIcon(StudyStatus.CLOSED)).toEqual({ icon: StdIconId.Sync, color: 'info-800' });
  });
});
