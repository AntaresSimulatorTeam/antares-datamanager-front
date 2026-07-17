import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@design-system-rte/react';
import { MAX_HORIZON_LENGTH } from '@/shared/const/studyConfig.ts';

interface YearInputProps {
  horizon: string;
  onChange: (inputValue: string) => void;
  required: boolean;
  onValidChange?: (isValid: boolean) => void;
  customErrorMessage?: string;
  disabled?: boolean;
}

const HorizonInput: React.FC<YearInputProps> = ({
  horizon,
  onChange,
  required = true,
  onValidChange,
  customErrorMessage,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validate = (value?: string): boolean => {
    if (!value || value.trim() === '') {
      if (required) {
        setErrorMessage(t('horizonInput.@requiredHorizon'));
        onValidChange?.(false);
        return false;
      } else {
        setErrorMessage('');
        onValidChange?.(true);
        return true;
      }
    }

    const trimmedValue = value.trim();

    if (!/^\d{4}$/.test(trimmedValue)) {
      setErrorMessage(t('horizonInput.@validYearError'));
      onValidChange?.(false);
      return false;
    }

    const numeric = Number(trimmedValue);

    if (isNaN(numeric) || numeric < 2000 || numeric > 9999) {
      setErrorMessage(t('horizonInput.@validYearError'));
      onValidChange?.(false);
      return false;
    }

    setErrorMessage('');
    onValidChange?.(true);
    return true;
  };

  //Only 4 digits allowed
  const handleInputChange = (text: string) => {
    const filtered = text.replace(/\D/g, '').slice(0, 4);
    onChange(filtered);

    if (filtered.length === 4) {
      validate(filtered);
    } else {
      setErrorMessage('');
      onValidChange?.(false);
    }
  };

  const hasError = !!customErrorMessage || !!errorMessage;

  const getAssistiveTextLabel = (): string =>
    customErrorMessage || errorMessage || t('components.horizonInput.@assistiveTextForYear');

  return (
    <TextInput
      id="text-input-horizon"
      label={t('home.@horizon')}
      value={horizon}
      placeholder={disabled && horizon ? horizon : ''}
      onChange={handleInputChange}
      onBlur={() => validate(horizon)}
      required={required}
      maxLength={MAX_HORIZON_LENGTH}
      showCounter={!disabled}
      disabled={disabled}
      error={hasError}
      assistiveTextLabel={getAssistiveTextLabel()}
      assistiveAppearance={customErrorMessage || errorMessage ? 'error' : 'description'}
      rightIconAction="clean"
      onRightIconClick={() => onChange('')}
    />
  );
};

export default HorizonInput;
