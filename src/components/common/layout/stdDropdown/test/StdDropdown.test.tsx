import { fakeDropdownShortList, fakeDropdownWithCustomElement } from '@/mocks/data/components/dropdownItems.mock';
import { render, screen } from '@testing-library/react';
import StdDropdown, { type StdDropdownProps } from '../StdDropdown';

const TEST_ID = 'my-dropdown';
const TEST_OPTIONS_WITH_CUSTOM_ELEMENT = [...fakeDropdownWithCustomElement, ...fakeDropdownShortList.slice(2)];

describe('StdDropdown', () => {
  it('properly renders the StdDropdown with the proper id', () => {
    render(<StdDropdown id={TEST_ID} items={fakeDropdownShortList} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('properly renders the items section', () => {
    render(<StdDropdown id={TEST_ID} items={fakeDropdownShortList} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('properly gives the container the combobox role if dropdown is multiple', () => {
    render(<StdDropdown id={TEST_ID} items={fakeDropdownShortList} isMultiple />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders the correct amount of items in the item section with the proper content', () => {
    render(<StdDropdown id={TEST_ID} items={fakeDropdownShortList} />);
    expect(screen.getAllByRole('option').length).toBe(fakeDropdownShortList.length);
    expect(document.querySelector(`#${fakeDropdownShortList[0].id}`)).toBeInTheDocument();
    expect(screen.getByText(fakeDropdownShortList[0].label)).toBeInTheDocument();
  });

  it('renders the correct amount of items with a custom elements', () => {
    render(<StdDropdown id={TEST_ID} items={TEST_OPTIONS_WITH_CUSTOM_ELEMENT as StdDropdownProps['items']} />);
    expect(screen.getAllByRole('link').length).toBe(fakeDropdownWithCustomElement.length);
  });
});
