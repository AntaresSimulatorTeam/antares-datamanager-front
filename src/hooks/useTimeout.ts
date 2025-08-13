import { useCallback, useEffect, useRef } from 'react';

/**
 * hook to call a function after a delay and provide reset and cancel options
 * @param callback function called after a delay
 * @param delay delay in ms (default 1000 ms)
 * @returns [reset, clear]
 *
 *   reset => restart the timer
 *
 *   clear => wipe the timer (do not call the callback)
 *
 * @example
 * const [name,setName] = useState("")
 * const [reset , clear] = useTimeout(()=>setName("toto"),1000)
 */
const useTimeout = (callback: () => void, delay = 1000) => {
  // useRef prevent multiple useEffect triggering with function dependency
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const set = useCallback(() => {
    // @ts-ignore
    timeoutRef.current = setTimeout(() => callbackRef.current(), delay);
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  return [reset, clear];
};

export default useTimeout;
