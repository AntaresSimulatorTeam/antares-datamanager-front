import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StdInputText from '@/components/forms/stdInputText/StdInputText.tsx';

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

  const handleBlur = () => {
    validate(horizon);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex w-1/2 flex-col">
        <StdInputText
          label={t('home.@horizon')}
          value={horizon}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeHolder={t('horizonInput.@horizonPlaceholder')}
          variant="outlined"
          required={required}
          maxLength={4}
          disabled={disabled}
          error={!!customErrorMessage || !!errorMessage}
          helperText={customErrorMessage || errorMessage}
        />
      </div>
    </div>
  );
};

export default HorizonInput;
