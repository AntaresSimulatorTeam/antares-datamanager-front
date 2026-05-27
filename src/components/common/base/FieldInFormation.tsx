import { useTranslation } from 'react-i18next';

export const FieldInFormation = () => {
  const { t } = useTranslation();
  return (
    <div className={'text-body-s text-gray-600'}>
      <span>
        {t('modal.@requiredAsterisk')}
        {' ('}
      </span>
      <span className={'text-error-700'}> {'*'}</span>
      <span> {')'}</span>
    </div>
  );
};
