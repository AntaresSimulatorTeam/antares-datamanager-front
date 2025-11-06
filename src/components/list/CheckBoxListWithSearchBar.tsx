import SearchBar from '@/pages/pegase/home/components/SearchBar.tsx';
import StdCheckboxGroupWrapper from '@common/forms/stdCheckboxGroup/StdCheckboxGroupWrapper.tsx';
import StdCheckbox from '@common/forms/stdCheckbox/StdCheckbox.tsx';
import { OTHER_AREAS } from '@/shared/const/studyConfig.ts';
import { RdsDivider } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import { CheckBoxData } from '@/shared/types';

interface CheckBoxListProps {
  checkedValues: string[];
  handleSelectionChange: (value: string, isChecked: boolean) => Promise<void> | void;
  options: CheckBoxData[];
  dividerPosition: number;
  handleSearch?: (_value?: string) => Promise<void>;
  disabled: boolean;
}

export const CheckBoxListWithSearchBar = ({
  checkedValues,
  handleSelectionChange,
  options,
  dividerPosition = 0,
  handleSearch,
  disabled = false,
}: CheckBoxListProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex max-h-[45vh] flex-none shrink flex-col self-start rounded border border-gray-400 p-2">
      <div className="border-b border-gray-400 pb-2">
        <SearchBar
          onSearch={(value?: string) => void handleSearch?.(value)}
          placeholder={t('studyDetails.@search_area')}
        />
      </div>
      <div className="relative min-h-0 overflow-y-auto">
        <StdCheckboxGroupWrapper
          label={''}
          name={''}
          checkedValues={checkedValues}
          disabled={disabled}
          onChange={(value: string, isChecked?: boolean) => void handleSelectionChange(value, isChecked ?? false)}
        >
          {options?.map((area, index) => (
            <div key={`${index}-${area.name}`} className="my-1">
              <StdCheckbox
                key={`parameter-checkbox-${area.name}`}
                label={
                  area.name !== OTHER_AREAS && area.isDefault
                    ? `${area.name} (${t('studyDetails.@default')})`
                    : area.name
                }
                value={area.name}
                name={''}
                disabled={area.isDefault}
                checked={area.isDefault}
              />
              {dividerPosition > 0 && index === Math.max(dividerPosition - 1, 0) && <RdsDivider extraClasses="mt-1" />}
            </div>
          ))}
        </StdCheckboxGroupWrapper>
      </div>
    </div>
  );
};
