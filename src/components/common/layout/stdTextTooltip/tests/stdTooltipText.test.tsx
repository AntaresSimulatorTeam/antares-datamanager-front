import { render, screen } from '@testing-library/react';
import StdTextTooltip from '../StdTextTooltip';

const TEST_COMPONENT = <div role="article" />;
const TEST_ID = 'tooltip-text-id';
const TEST_TEXT = 'test-text';

describe('StdTextTooltip', () => {
  it('render the StdTextTooltip component with expected id, tooltip text and children', () => {
    render(
      <StdTextTooltip text={TEST_TEXT} id={TEST_ID} show>
        {TEST_COMPONENT}
      </StdTextTooltip>,
    );

    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
    expect(screen.getByRole('tooltip').textContent).toBe(TEST_TEXT);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
