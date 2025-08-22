import React from 'react';
import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import StdButton from '@common/base/stdButton/StdButton';

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
        <StdButton label={t('trajectoryDeletionModal.@cancel')} variant="text" color="secondary" onClick={onClose} />
        <StdButton
          label={t('trajectoryDeletionModal.@confirm')}
          variant="text"
          color="danger"
          onClick={() => void onConfirm()}
        />
      </RdsModal.Footer>
    </RdsModal>
  );
};
