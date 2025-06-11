export type PegaseBreadcrumbItemType = {
  key: string;
  label: string;
  target?: string;
  data: { id: string; name: string } | null;
  onClickItem: void | ((id: string, name: string) => Promise<void>);
  id?: string;
};
