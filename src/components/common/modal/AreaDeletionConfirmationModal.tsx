import React from 'react';
import { RdsModal, RdsButton } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';

interface AreaDeletionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const AreaDeletionConfirmationModal: React.FC<AreaDeletionConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>
        {t('trajectoryDeletionModal.@confirmDeleteTitle')}
      </RdsModal.Title>
      <RdsModal.Content>
        <p>{t('trajectoryDeletionModal.@confirmDeleteMessage')}</p>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label={t('trajectoryDeletionModal.@cancel')} onClick={onClose} />
        <RdsButton
          label={t('trajectoryDeletionModal.@confirm')}
          color="primary"
          onClick={() => {
            void onConfirm();
          }}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
