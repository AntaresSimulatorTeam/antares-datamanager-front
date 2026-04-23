import React from 'react';
import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@design-system-rte/react';

interface AreaDeletionConfirmationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  message?: string;
}

export const AreaDeletionConfirmationModal: React.FC<AreaDeletionConfirmationModalProps> = ({
  isOpen = false,
  onClose,
  onConfirm,
  message,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <RdsModal size="small">
      <RdsModal.Title onClose={onClose}>{t('trajectoryDeletionModal.@confirmDeleteTitle')}</RdsModal.Title>
      <RdsModal.Content>
        <p>{message ?? t('trajectoryDeletionModal.@confirmDeleteMessage')}</p>
      </RdsModal.Content>
      <RdsModal.Footer>
        <Button label={t('trajectoryDeletionModal.@cancel')} variant="text" onClick={onClose} />
        <Button label={t('trajectoryDeletionModal.@confirm')} variant="secondary" onClick={() => void onConfirm()} />
      </RdsModal.Footer>
    </RdsModal>
  );
};
