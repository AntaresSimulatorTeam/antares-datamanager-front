import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@design-system-rte/react';

interface AreaDeletionConfirmationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  message?: string;
  title?: string;
  isBusy?: boolean;
  id?: string;
}

export const AreaDeletionConfirmationModal: React.FC<AreaDeletionConfirmationModalProps> = ({
  isOpen = false,
  onClose,
  onConfirm,
  message,
  title,
  isBusy = false,
  id = 'area-deletion-modal',
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      id={id}
      onClose={() => {
        if (!isBusy) onClose();
      }}
      primaryButton={
        <Button
          label={t('trajectoryDeletionModal.@confirm')}
          variant="secondary"
          onClick={() => void onConfirm()}
          disabled={isBusy}
        />
      }
      secondaryButton={
        <Button label={t('trajectoryDeletionModal.@cancel')} variant="text" onClick={onClose} disabled={isBusy} />
      }
      size="s"
      title={title ?? t('trajectoryDeletionModal.@confirmDeleteTitle')}
      className="[&_h2]:!text-left"
      closeOnOverlayClick={false}
    >
      <p>{message ?? t('trajectoryDeletionModal.@confirmDeleteMessage')}</p>
    </Modal>
  );
};
