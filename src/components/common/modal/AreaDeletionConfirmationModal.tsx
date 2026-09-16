import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@design-system-rte/react';

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

  return (
    <Modal
      isOpen={isOpen}
      id="area-deletion-modal"
      onClose={onClose}
      primaryButton={<Button label={t('trajectoryDeletionModal.@confirm')} variant="secondary" onClick={() => void onConfirm()} />}
      secondaryButton={<Button label={t('trajectoryDeletionModal.@cancel')} variant="text" onClick={onClose} />}
      size="s"
      title={t('trajectoryDeletionModal.@confirmDeleteTitle')}
      className="[&_h2]:!text-left"
      closeOnOverlayClick={false}
    >
      <p>{message ?? t('trajectoryDeletionModal.@confirmDeleteMessage')}</p>
    </Modal>
  );
};
