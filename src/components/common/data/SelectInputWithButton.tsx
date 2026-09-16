import { useTranslation } from 'react-i18next';
import { Button } from '@design-system-rte/react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { DropdownItemOption } from '@/shared/types';

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
    <div className="flex w-[400px] items-center justify-start gap-2">
      <SelectAndSearchableInput
        onSelect={(value: DropdownItemOption) => void onSelect(value)}
        setSearchTerm={async (value?: string) => await onSearch(value)}
        defaultPlaceHolder={isDisabled ? '' : placeHolder || t('studyDetails.@select_trajectory')}
        isSearchable={true}
        isInputDisabled={isDisabled}
        dropdownWidth={250}
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
