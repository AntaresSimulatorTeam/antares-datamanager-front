import { noop } from '@/shared/utils/defaultUtils';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { render, screen } from '@testing-library/react';
import StdDropdownItem from '../subComponents/StdDropdownItem';
import { AnchorDefaultAsType } from '@/shared/types';

const TEST_LABEL = 'Label';
const TEST_VALUE = 'value';
const TEST_ICON = StdIconId.Add;
const TEST_ID = 'my-dropdown-item';
const TEST_CUSTOM_ELEMENT = AnchorDefaultAsType;

describe('StdDropdownItem', () => {
  it('renders the default StdDropdownItem component', () => {
    render(<StdDropdownItem label={TEST_LABEL} value={TEST_VALUE} onClick={noop} />);
    const item = screen.getByRole('option');
    expect(item).toBeInTheDocument();
    expect(item.textContent).toBe(TEST_LABEL);
  });

  it('renders the StdDropdownItem with the proper id when specified', () => {
    render(<StdDropdownItem label={TEST_LABEL} value={TEST_VALUE} id={TEST_ID} onClick={noop} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdDropdownItem component with icon + label', () => {
    render(<StdDropdownItem label={TEST_LABEL} value={TEST_VALUE} icon={TEST_ICON} onClick={noop} />);
    const item = screen.getByRole('option');
    expect(item).toBeInTheDocument();
    expect(item.textContent).toContain(TEST_LABEL);
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });

  it('renders the StdDropdownItem component with custom element', () => {
    render(
      <StdDropdownItem
        label={TEST_LABEL}
        value={TEST_VALUE}
        icon={TEST_ICON}
        onClick={noop}
        as={TEST_CUSTOM_ELEMENT}
        role="link"
      />,
    );
    const item = screen.getByRole('link');
    expect(item).toBeInTheDocument();
    expect(item.textContent).toContain(TEST_LABEL);
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });
});
