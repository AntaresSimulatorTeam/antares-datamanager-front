import { DivDefaultAsType } from '@/components/common/base/element.type';
import StdCheckbox from '@/components/common/forms/stdCheckbox/StdCheckbox';
import { useStdId } from '@/hooks/useStdId';
import { type JSX } from 'react';
import { dropdownElementClassBuilder } from '../dropdownClassBuilder';
import useActiveKeyboard from '@/hooks/useActiveKeyboard';
import { Icon } from '@design-system-rte/react';

type StdDropDownItemOwnProps<E extends React.ElementType | undefined> = {
  id?: string;
  label: string | JSX.Element;
  value: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  onCheckedChange?: (checked?: boolean) => void;
  icon?: string;
  extraClasses?: string;
  withCheckbox?: boolean;
  style?: React.CSSProperties;
  as?: E;
};

export type StdDropDownItemProps<E extends React.ElementType | undefined = undefined> = StdDropDownItemOwnProps<E> &
  (E extends React.ElementType ? Omit<React.ComponentProps<E>, keyof StdDropDownItemOwnProps<E>> : unknown);

const ICON_SIZE = 16;

const StdDropdownItem = <E extends React.ElementType>({
  id: propsId,
  label,
  disabled = false,
  active = false,
  onClick,
  onCheckedChange,
  icon,
  extraClasses,
  withCheckbox = false,
  style,
  as,
  value: _value,
  ...otherProps
}: StdDropDownItemProps<E>) => {
  const id = useStdId('dropdown-item', propsId);

  const [handlerKeyboardEvent, isActiveKeyboard] = useActiveKeyboard<HTMLDivElement>(onClick, { id });
  const { onKeyDown, onKeyUp, onBlur } = handlerKeyboardEvent;

  const Element = as ?? DivDefaultAsType;

  return (
    <Element
      id={id}
      onClick={onClick}
      className={dropdownElementClassBuilder(disabled, active, isActiveKeyboard, extraClasses)}
      tabIndex={withCheckbox ? -1 : 0}
      aria-selected={active}
      style={style}
      role="option"
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={onBlur}
      {...otherProps}
    >
      {withCheckbox && (
        <span className="pl-0.5" onClick={(e) => e.stopPropagation()} role="none">
          <StdCheckbox checked={active} onChange={onCheckedChange} />
        </span>
      )}
      {icon && <Icon name={icon} size={ICON_SIZE} />}
      {label}
    </Element>
  );
};

export default StdDropdownItem;
