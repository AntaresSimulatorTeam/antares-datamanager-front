import { RdsBreadcrumbSeparator } from 'rte-design-system-react';
import { PegaseBreadcrumbItem } from '@common/layout/PegaseBreadcrumb/PegaseBreadcrumbItem.tsx';
import { PegaseBreadcrumbItemType } from '@/shared/types';

export const PegaseLinearBreadcrumb = ({ items }: { items: PegaseBreadcrumbItemType[] }) =>
  items.map((item, index) => (
    <div key={item.key} className="rds-flex rds-gap-0.5 rds-align-middle">
      {index ? <RdsBreadcrumbSeparator /> : ''}
      <PegaseBreadcrumbItem
        key={item.key}
        label={item.label}
        onClickItem={item.onClickItem}
        id={item.id}
        data={item.data}
      />
    </div>
  ));
