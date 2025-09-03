import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import StdButton from '@common/base/stdButton/StdButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

interface DeletionModalProps {
  onClose: () => void;
  handleDeletionRow: () => Promise<void>;
}

export const DeletionModal = ({ onClose, handleDeletionRow }: DeletionModalProps) => {
  const { t } = useTranslation();
  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>{t('deletionModal.@title')}</RdsModal.Title>
      <RdsModal.Content>{t('deletionModal.@content')}</RdsModal.Content>
      <RdsModal.Footer>
        <StdButton label="Cancel" onClick={onClose} color="secondary" />
        <StdButton
          icon={StdIconId.Delete}
          label={t('study.@delete')}
          onClick={() => void handleDeletionRow()}
          variant="text"
          color="danger"
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
