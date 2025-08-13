import { render, screen } from '@testing-library/react';

import StdHeading from '../StdHeading';

const TEST_TITLE = 'My section title';

describe('StdHeading', () => {
  it('renders StdHeading component', () => {
    render(<StdHeading title={TEST_TITLE} />);
    const title = screen.getByRole('heading');
    expect(title).toBeInTheDocument();
    expect(title.textContent).toBe(TEST_TITLE);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
