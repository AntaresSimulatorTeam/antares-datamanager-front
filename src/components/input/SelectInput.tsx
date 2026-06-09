/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { SelectDSOption } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { Select } from '@design-system-rte/react';

interface SelectProps {
  valueSelected: SelectDSOption;
  onChange: (value: SelectDSOption) => void;
  required?: boolean;
  options?: SelectDSOption[];
}

const SelectInput: React.FC<SelectProps> = ({ valueSelected, onChange, required = false, options }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '40%',
      }}
    >
      <Select
        id="project-select"
        value={valueSelected?.value ?? ''}
        onChange={(value: string) => {
          const selectedProject = options?.find((option) => option.value === value);
          if (selectedProject) {
            onChange(selectedProject);
          }
        }}
        label={t('page.@project')}
        options={options ?? []}
        multiple={false}
        required={required}
      />
    </div>
  );
};

export default SelectInput;
