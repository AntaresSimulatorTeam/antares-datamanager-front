import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@design-system-rte/react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getAreaDeletionModalTitle } from '@/shared/utils/trajectoryUtils.ts';

interface AreaDeletionConfirmationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  type?: TRAJECTORY_TYPE;
  message?: string;
}

export const AreaDeletionConfirmationModal: React.FC<AreaDeletionConfirmationModalProps> = ({
  isOpen = false,
  onClose,
  onConfirm,
  type,
  message
}) => {
  const { t } = useTranslation();
  const getModalTile = type ? t(getAreaDeletionModalTitle(type)) : t('trajectoryDeletionModal.@confirmDeleteTitle');

  return (
    <Modal
      isOpen={isOpen}
      id="area-deletion-confirmation-modal"
      onClose={() => {
        onClose();
      }}
      primaryButton={
        <Button
          label={t('trajectoryDeletionModal.@confirm')}
          hierarchy="secondary"
          onClick={() => void onConfirm()}
        />
      }
      secondaryButton={
        <Button label={t('trajectoryDeletionModal.@cancel')} hierarchy="text" onClick={onClose} />
      }
      size="s"
      title={getModalTile}
      closeOnOverlayClick={false}
    >
      <p>{message}</p>
    </Modal>
  );
};
