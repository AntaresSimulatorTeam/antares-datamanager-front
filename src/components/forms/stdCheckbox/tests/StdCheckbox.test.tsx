import { render, screen } from '@testing-library/react';

import StdCheckbox from '../StdCheckbox';

const TEST_LABEL = 'My checkbox';
const TEST_ID = 'my-checkbox';
const TEST_NAME = 'checkbox';

describe('StdCheckbox', () => {
  it('renders the basic StdCheckbox component', () => {
    render(<StdCheckbox label={TEST_LABEL} name={TEST_NAME} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
  });

  it('renders the StdCheckbox component with no label', () => {
    render(<StdCheckbox name={TEST_NAME} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('can properly find the checkbox when the id is specified', () => {
    render(<StdCheckbox label={TEST_LABEL} id={TEST_ID} name={TEST_NAME} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdCheckbox with checked', () => {
    render(<StdCheckbox label={TEST_LABEL} name={TEST_NAME} checked={true} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders the StdCheckbox when disabled', () => {
    render(<StdCheckbox label={TEST_LABEL} name={TEST_NAME} disabled={true} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
