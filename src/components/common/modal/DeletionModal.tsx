import { RdsButton, RdsIconId, RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';

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
        <RdsButton label="Cancel" onClick={onClose} color="secondary" />
        <RdsButton
          icon={RdsIconId.Delete}
          label={t('study.@delete')}
          onClick={() => void handleDeletionRow()}
          variant="text"
          color="danger"
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
