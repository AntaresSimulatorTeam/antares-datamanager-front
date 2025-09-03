import { StdChangeHandler } from '@/shared/types/StdBase.type';
import { useEffect, useRef, useState } from 'react';
import useDebounce from './useDebounce';

export const useInputFormState = <TValue>(
  value: TValue,
  defaultValue: TValue,
  onChange: StdChangeHandler<TValue> | undefined,
  updateRef?: (value: TValue) => void,
) => {
  const [stateValue, setStateValue] = useState<TValue>(defaultValue || value);
  const updateRefRef = useRef<typeof updateRef | undefined>(updateRef);

  const renderCount = useRef(0);
  renderCount.current += 1;
  useEffect(() => {
    if (renderCount.current > 1) {
      setStateValue(value);
      updateRefRef.current?.(value);
    }
  }, [value]);

  useEffect(() => {
    updateRefRef.current?.(stateValue);
  }, [stateValue]);

  useDebounce(async () => await onChange?.(stateValue ?? defaultValue), stateValue);

  return { value: stateValue, setValue: setStateValue };
};
