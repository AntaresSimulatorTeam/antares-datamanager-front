import { dividerClassBuilder } from './dividerClassBuilder';

export type StdDividerProps = {
  extraClasses?: string;
};

const StdDivider = ({ extraClasses }: StdDividerProps) => {
  const dividerClasses = dividerClassBuilder(extraClasses);
  return <hr className={dividerClasses} role="separator" />;
};

export default StdDivider;
