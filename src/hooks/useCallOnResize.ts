import { throttle } from '@/shared/utils/throttle';
import { RefObject, useCallback, useLayoutEffect, useRef } from 'react';
export function useCallOnResize(
  callback: () => void,
  options?: {
    elementRef?: RefObject<HTMLElement | null>;
    debounceTime?: number;
  },
) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleResize = useCallback(() => {
    callbackRef.current();
  }, []);

  useLayoutEffect(() => {
    const { elementRef, debounceTime = 100 } = options || {};
    let resizeObserver: ResizeObserver | undefined;
    const { throttled: throttledHandleResize, cancel } = throttle(handleResize, debounceTime);

    if (elementRef && elementRef.current) {
      resizeObserver = new ResizeObserver(throttledHandleResize);
      resizeObserver.observe(elementRef.current);
    } else {
      window.addEventListener('resize', throttledHandleResize);
    }

    handleResize();

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', throttledHandleResize);
      }
      cancel();
    };
  }, [handleResize, options]);
}
