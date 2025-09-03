export const stopPropagation =
  <TElement extends HTMLElement, TEvent extends React.UIEvent<TElement, UIEvent>>(func?: (ev: TEvent) => void) =>
  (e: TEvent) => {
    e.stopPropagation();
    func?.(e);
  };

export const stopPropagationAndPreventDefault = <
  TElement extends HTMLElement,
  TEvent extends React.UIEvent<TElement, UIEvent>,
>(
  event: TEvent,
): void => {
  event.stopPropagation();
  event.preventDefault();
};
