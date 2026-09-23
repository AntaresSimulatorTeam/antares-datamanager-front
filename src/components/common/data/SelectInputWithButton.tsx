import { useTranslation } from 'react-i18next';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { DropdownItemOption } from '@/shared/types';
import { Button } from '@design-system-rte/react';

interface SelectInputWithButtonProps {
  onSelect: (value: DropdownItemOption) => void;
  onSearch: (value?: string) => Promise<DropdownItemOption[] | undefined>;
  isDisabled: boolean;
  onClickButton?: () => void | Promise<void>;
  placeHolder?: string;
}

export const SelectInputWithButton = ({
  onSelect,
  onSearch,
  onClickButton,
  isDisabled,
  placeHolder,
}: SelectInputWithButtonProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-start gap-2">
        <SelectAndSearchableInput
          onSelect={(value: DropdownItemOption) => void onSelect(value)}
          setSearchTerm={async (value?: string) => await onSearch(value)}
          defaultPlaceHolder={isDisabled ? '' : placeHolder || t('studyDetails.@select_trajectory')}
          isSearchable={true}
          isInputDisabled={isDisabled}
          dropdownWidth={30}
        />
      <span>{t('studyDetails.@or')}</span>
      <Button
        label={t('studyDetails.@import_file')}
        icon="upload"
        iconPosition="left"
        onClick={() => void onClickButton?.()}
        variant="primary"
        disabled={isDisabled}
      />
    </div>
  );
};
