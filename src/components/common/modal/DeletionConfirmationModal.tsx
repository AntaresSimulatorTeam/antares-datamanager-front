import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@design-system-rte/react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getAreaDeletionModalTitle } from '@/shared/utils/trajectoryUtils.ts';

interface DeletionConfirmationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  type?: TRAJECTORY_TYPE;
  message?: string;
  title?: string;
}

export const DeletionConfirmationModal: React.FC<DeletionConfirmationModalProps> = ({
  isOpen = false,
  onClose,
  onConfirm,
  type,
  message,
  title
}) => {
  const { t } = useTranslation();
  const getModalTile = title ? title : t(getAreaDeletionModalTitle(type));

  return (
    <Modal
      isOpen={isOpen}
      id="deletion-confirmation-modal"
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
