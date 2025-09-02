import React from 'react';
import { RdsButton, RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';

interface AreaDeletionConfirmationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const AreaDeletionConfirmationModal: React.FC<AreaDeletionConfirmationModalProps> = ({
  isOpen = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>{t('trajectoryDeletionModal.@confirmDeleteTitle')}</RdsModal.Title>
      <RdsModal.Content>
        <p>{t('trajectoryDeletionModal.@confirmDeleteMessage')}</p>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label={t('trajectoryDeletionModal.@cancel')} variant="text" color="secondary" onClick={onClose} />
        <RdsButton
          label={t('trajectoryDeletionModal.@confirm')}
          variant="text"
          color="danger"
          onClick={() => void onConfirm()}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
