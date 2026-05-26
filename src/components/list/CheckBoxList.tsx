import { useTranslation } from 'react-i18next';
import { CheckBoxData } from '@/shared/types';
import { Checkbox, Divider } from '@design-system-rte/react';

interface CheckBoxListProps {
  checkedValues: string[];
  handleSelectionChange: (value: string, isChecked: boolean) => Promise<void> | void;
  options: CheckBoxData[];
}

export const CheckBoxList = ({ checkedValues, handleSelectionChange, options }: CheckBoxListProps) => {
  const { t } = useTranslation();
  const optionsDefault = options.filter((option) => option.isDefault);
  const optionsNotDefault = options.filter((option) => !option.isDefault);

  return (
    <div className="flex max-h-[45vh] w-1/5 flex-none shrink flex-col gap-1 self-start rounded border border-gray-400 px-3 py-2">
      {optionsDefault?.map((area, index) => (
        <Checkbox
          key={`${index}-${area.name}`}
          description={t('studyDetails.@checkBoxDefault')}
          id={area.name}
          label={area.name}
          value={area.name}
          disabled={area.isDefault}
          onClick={() => void handleSelectionChange(area.name, !checkedValues.includes(area.name))}
          checked={area.isDefault}
          showLabel
        />
      ))}
      <Divider />
      <div className="relative min-h-0 overflow-y-auto">
        {optionsNotDefault?.map((area, index) => (
          <Checkbox
            key={`${index}-${area.name}`}
            id={area.name}
            label={area.name}
            value={area.name}
            onClick={() => void handleSelectionChange(area.name, !checkedValues.includes(area.name))}
          />
        ))}
      </div>
    </div>
  );
};
