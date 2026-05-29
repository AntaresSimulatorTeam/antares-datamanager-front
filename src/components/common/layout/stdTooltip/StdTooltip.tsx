import { useStdId } from '@/hooks/useStdId';
import { PropsWithChildren } from 'react';

type StdTooltipProps = {
  id?: string;
  className?: string;
};

const TOOLTIP_CLASSES = 'rounded bg-gray-800 px-1 py-0.5 text-caption font-semibold text-gray-w shadow-4 max-w-xs whitespace-normal break-words';

const StdTooltip = ({ children, id: idProps, className }: PropsWithChildren<StdTooltipProps>) => {
  const id = useStdId('tooltip', idProps);
  return (
    <div className={`${TOOLTIP_CLASSES} ${className || ''}`} role="tooltip" id={id}>
      {children}
    </div>
  );
};

export default StdTooltip;
