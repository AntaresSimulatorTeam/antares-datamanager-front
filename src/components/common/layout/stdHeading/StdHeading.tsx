import { useStdId } from '@/hooks/useStdId';
import { headingClassBuilder } from './headingClassBuilder';

type StdHeadingProps = {
  title: string;
  level?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  id?: string;
};

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingSize = 'xl' | 'l' | 'm' | 's' | 'xs';
export type HeadingWeight = 'regular' | 'semibold';

const StdHeading = ({ title, level = 'h2', size = 'l', weight = 'semibold', id: propsId }: StdHeadingProps) => {
  const id = useStdId('heading', propsId);
  const HeadingComponent = level;
  const headingClasses = headingClassBuilder(size, weight);

  return (
    <div className="header" id={id}>
      <HeadingComponent className={headingClasses}>{title}</HeadingComponent>
      <hr className="w-9 border-t-2 border-primary-600" role="separator" />
    </div>
  );
};

export default StdHeading;
