import { render, screen } from '@testing-library/react';

import StdDivider from '../StdDivider';

describe('StdDivider', () => {
  it('renders StdDivider component', () => {
    render(<StdDivider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
