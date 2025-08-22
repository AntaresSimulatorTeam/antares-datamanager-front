export const throttle = <T extends (...args: never[]) => void>(fn: T, limit: number) => {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>): void => {
    const now = performance.now();

    // Store the latest arguments
    lastArgs = args;

    // If it's the first call or enough time has elapsed
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);

      // Clear any pending execution since we just executed
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else if (!timeoutId) {
      // Schedule a delayed execution for the most recent call
      const timeUntilNextExecution = limit - (now - lastCall);

      timeoutId = setTimeout(() => {
        lastCall = performance.now();
        timeoutId = null;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, timeUntilNextExecution);
    }
  };

  const cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return { throttled, cancel };
};
