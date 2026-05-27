import { useTranslation } from 'react-i18next';
import { CheckBoxData } from '@/shared/types';
import { Checkbox, Divider } from '@design-system-rte/react';
import { useMemo } from 'react';

interface CheckBoxListProps {
  checkedValues: string[];
  handleSelectionChange: (value: string, isChecked: boolean) => Promise<void> | void;
  options: CheckBoxData[];
  disabled?: boolean;
}

export const CheckBoxList = ({ disabled, checkedValues, handleSelectionChange, options }: CheckBoxListProps) => {
  const { t } = useTranslation();
  const optionsDefault = useMemo(() => options.filter((option) => option.isDefault), [options]);
  const optionsNotDefault = useMemo(() => options.filter((option) => !option.isDefault), [options]);

  return (
    <div className="flex max-h-[45vh] w-1/5 flex-none shrink flex-col gap-1 self-start rounded border border-gray-400 p-2 text-left">
      {optionsDefault?.map((area, index) => (
        <Checkbox
          key={`${index}-${area.name}`}
          id={area.name}
          label={area.name}
          value={area.name}
          disabled={area.isDefault}
          onClick={() => void handleSelectionChange(area.name, !checkedValues.includes(area.name))}
          checked={area.isDefault}
          showLabel
        />
      ))}
      <span className="ml-3 text-body-xs text-gray-400">{t('studyDetails.@checkBoxDefault')}</span>
      <Divider />
      <div className="[&_label]::text-body-s relative min-h-0 overflow-y-auto">
        {optionsNotDefault?.map((area, index) => (
          <Checkbox
            key={`${index}-${area.name}`}
            id={area.name}
            label={area.name}
            value={area.name}
            checked={checkedValues.includes(area.name)}
            disabled={disabled}
            onClick={() => void handleSelectionChange(area.name, !checkedValues.includes(area.name))}
          />
        ))}
      </div>
    </div>
  );
};
