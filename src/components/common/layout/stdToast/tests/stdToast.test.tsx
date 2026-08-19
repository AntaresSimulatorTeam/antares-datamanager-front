import { render, screen } from '@testing-library/react';

import { noop } from '@/shared/utils/defaultUtils';
import StdToast from '../StdToast';

const TEST_ID_COMPONENT = 'my-custom-content';
const TEST_COMPONENT = <span data-testid={TEST_ID_COMPONENT} />;
const TEST_MESSAGE = 'my-message';
const TEST_ID = 'my-toast';
const TEST_ACTION = {
  label: 'test-action',
  onClick: noop,
};

describe('StdToast', () => {
  it('renders the default StdToast component with a text', () => {
    render(<StdToast message={TEST_MESSAGE} />);
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
  });

  it('renders the StdToast component with a message', () => {
    render(<StdToast message={TEST_MESSAGE} />);
    expect(screen.getByText(TEST_MESSAGE)).toBeInTheDocument();
  });

  it('renders the StdToast component with a component', () => {
    render(<StdToast message={TEST_COMPONENT} />);
    expect(screen.getByTestId(TEST_ID_COMPONENT)).toBeInTheDocument();
  });

  it('renders the StdToast with the proper id when specified', () => {
    render(<StdToast message={TEST_MESSAGE} id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the StdToast component with action', () => {
    render(<StdToast message={TEST_MESSAGE} action={TEST_ACTION} />);
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast.textContent).toContain(TEST_MESSAGE);
    const actionButton = screen.getByRole('button');
    expect(actionButton).toBeInTheDocument();
    expect(actionButton.textContent).toBe(TEST_ACTION.label);
  });
});
