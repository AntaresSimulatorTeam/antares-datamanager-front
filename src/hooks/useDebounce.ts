import { useEffect, useRef } from 'react';
import useTimeout from './useTimeout.ts';

/**
 * Hook that call the callback after a delay and reset timer when dependencies are updated
 *
 * @usage send update when filling input, it will call the update but not while typing.
 * @example useDebounce(onChange,dep1,1000)
 * @param callback function to call after the timer
 * @param whatchingDependency dependency that reset the timer
 * @param delay delay in ms
 */
const useDebounce = (callback: () => void | Promise<void>, whatchingDependency: unknown, delay = 200) => {
  const callbackRef = useRef(callback);
  const [reset, clear] = useTimeout(() => void callbackRef.current(), delay);

  useEffect(() => {
    reset();
  }, [whatchingDependency, reset]);

  useEffect(() => {
    callbackRef.current = callback;
  }, [whatchingDependency, callback]);
  useEffect(clear, [clear]);
};

export default useDebounce;
