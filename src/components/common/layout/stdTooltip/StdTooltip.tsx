import { useStdId } from '@/hooks/useStdId';
import { PropsWithChildren } from 'react';

type StdTooltipProps = {
  id?: string;
};

const TOOLTIP_CLASSES = 'rounded bg-gray-800 px-1 py-0.5 text-caption font-semibold text-gray-w shadow-4';

const StdTooltip = ({ children, id: idProps }: PropsWithChildren<StdTooltipProps>) => {
  const id = useStdId('tooltip', idProps);
  return (
    <div className={TOOLTIP_CLASSES} role="tooltip" id={id}>
      {children}
    </div>
  );
};

export default StdTooltip;
