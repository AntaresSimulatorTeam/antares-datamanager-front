import useActiveKeyboard from '@/hooks/useActiveKeyboard';
import { useStdId } from '@/hooks/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { MouseEventHandler } from 'react';
import { tabItemClassBuilder } from './tabClassBuilder';
import StdButton from '@common/base/stdButton/StdButton';

export type TabItemType = 'primary' | 'secondary';

export type StdTabItemProps = {
  onClick: (selectedItemName: string) => void;
  name: string;
  tabType?: TabItemType;
  id?: string;
  label?: string;
  icon?: StdIconId;
  active?: boolean;
  disabled?: boolean;
  button?: {
    icon: StdIconId;
    onClick: MouseEventHandler<HTMLButtonElement>;
  };
  onDropdown?: MouseEventHandler<HTMLInputElement>;
  secondary?: Omit<StdTabItemProps, 'onClick' | 'secondary'>[];
  alwaysClickable?: boolean;
};

const ICON_SIZE = 16;

const StdTabItem = ({
  id: propsId,
  tabType = 'primary',
  label,
  icon,
  active,
  disabled,
  name,
  onClick,
  button,
  alwaysClickable,
}: StdTabItemProps) => {
  const id = useStdId('tbi', propsId);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
  const [handlerKeyboardEvent, isActiveKeyboard] = useActiveKeyboard<HTMLDivElement>(() => onClick?.(name), { id });
  const { contentContainerClasses, borderClasses } = tabItemClassBuilder(
    tabType,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    isActiveKeyboard,
    icon,
    active,
    disabled,
    alwaysClickable,
  );

  return (
    <div role="tab" id={id} aria-selected={active} aria-disabled={disabled} aria-label={label} aria-controls={name}>
      <div
        className={contentContainerClasses}
        id={id}
        onClick={() => !disabled && onClick(name)}
        tabIndex={disabled ? -1 : 0}
        {...handlerKeyboardEvent}
      >
        {icon && <StdIcon name={icon} width={ICON_SIZE} height={ICON_SIZE} />}
        {label && <span className="whitespace-nowrap">{label}</span>}
        {button && (
          <StdButton
            icon={button.icon}
            onClick={button.onClick}
            variant="transparent"
            size="extraSmall"
            disabled={disabled}
          />
        )}
      </div>
      {tabType === 'primary' && <div className={borderClasses} />}
    </div>
  );
};

export default StdTabItem;
