import { useStdId } from '@/hooks/useStdId';
import { ZIndex } from '@/shared/types/Tailwind.type';
import { findSlotOfType } from '@/shared/utils/slotsUtils';
import {
  FloatingArrow,
  FloatingFocusManager,
  FloatingPortal,
  OffsetOptions,
  Placement,
  arrow as arrowMw,
  autoUpdate,
  flip as flipMw,
  offset as offsetMw,
  size as sizeMw,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import { ReactElement, useEffect, useRef, useState } from 'react';
import StdFloatingElement from './slots/stdFloatingElement/StdFloatingElement';
import StdFloatingTrigger from './slots/stdFloatingTrigger/StdFloatingTrigger';

type StdFloatingWrapperProps = {
  children: ReactElement | ReactElement[];
  show?: boolean;
  setShow?: (value: boolean) => void;
  placement?: Placement;
  offset?: OffsetOptions;
  fallbackPlacements?: Placement[];
  fitWidth?: boolean;
  disabled?: boolean;
  interactiveMode?: 'click' | 'hover';
  autoClose?: boolean;
  arrowParams?: { enabled: boolean; className?: string };
  stopPropagation?: boolean;
  id?: string;
  zIndex?: ZIndex;
  onClose?: () => void;
};

export const TRIGGER_PREFIX_ID = 'trigger-floating';
export const ELEMENT_PREFIX_ID = 'element-floating';

const StdFloatingWrapperComponent = ({
  children,
  show,
  setShow,
  placement,
  offset,
  fallbackPlacements = ['bottom', 'top', 'left', 'right'],
  fitWidth,
  disabled = false,
  interactiveMode = 'click',
  autoClose = false,
  arrowParams,
  stopPropagation,
  id: idProps,
  zIndex = 'z-50',
  onClose,
}: StdFloatingWrapperProps) => {
  const [showWrapper, setShowWrapper] = useState<boolean>(false);
  const TriggerComponent = findSlotOfType(children, StdFloatingTrigger);
  const ElementComponent = findSlotOfType(children, StdFloatingElement);
  const arrowRef = useRef(null);
  const id = useStdId('floating', idProps);
  const showFloating = show ?? showWrapper;
  const setShowFloating = setShow ?? setShowWrapper;
  const { context, refs, floatingStyles } = useFloating({
    open: !disabled ? showFloating : false,
    onOpenChange: !disabled ? setShowFloating : undefined,
    whileElementsMounted: autoUpdate,
    placement,
    middleware: [
      flipMw({
        fallbackPlacements,
      }),
      offsetMw(offset),
      fitWidth &&
        sizeMw({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
            });
          },
        }),
      arrowMw({ element: arrowRef }),
    ],
  });

  useEffect(() => {
    if (!showFloating) {
      onClose?.();
    }
  }, [onClose, showFloating]);

  const click = useClick(context, { enabled: interactiveMode === 'click' });
  const hover = useHover(context, { enabled: interactiveMode === 'hover' });
  const focus = useFocus(context, { enabled: interactiveMode === 'hover' });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, hover, focus, dismiss]);

  const { isMounted, styles } = useTransitionStyles(context);

  return (
    <>
      <div
        ref={refs.setReference}
        id={`${TRIGGER_PREFIX_ID}-${id}`}
        {...getReferenceProps({ onClick: stopPropagation ? (e) => e.stopPropagation() : undefined })}
      >
        {TriggerComponent}
      </div>
      {isMounted && ElementComponent && (
        <FloatingPortal preserveTabOrder={true}>
          <FloatingFocusManager context={context} initialFocus={-1} modal={false} returnFocus={false}>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, ...styles }}
              id={`${ELEMENT_PREFIX_ID}-${id}`}
              onClick={() => autoClose && setShowFloating(false)}
              className={zIndex}
              {...getFloatingProps()}
            >
              {arrowParams?.enabled && (
                <FloatingArrow context={context} ref={arrowRef} className={arrowParams?.className} />
              )}
              {ElementComponent}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

const StdFloatingWrapper = Object.assign(StdFloatingWrapperComponent, {
  Trigger: StdFloatingTrigger,
  Element: StdFloatingElement,
});

export default StdFloatingWrapper;
