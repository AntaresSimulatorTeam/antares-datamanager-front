import { ElementType } from 'react';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { AnchorDefaultAsType } from '@common/base/element.type.ts';

export type MenuNavBarItem<E extends ElementType = AnchorDefaultAsType> = {
  key: string;
  label: string;
  icon: StdIconId;
  id?: string;
  path?: string;
  as?: E;
};
