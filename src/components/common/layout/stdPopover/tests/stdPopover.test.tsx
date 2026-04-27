import { render, screen } from '@testing-library/react';
import { ELEMENT_PREFIX_ID, TRIGGER_PREFIX_ID } from '../../stdFloatingWrapper/StdFloatingWrapper';
import StdPopover from '../StdPopover';
import { Button } from '@design-system-rte/react';

const TEST_ID = 'some-id';
const TEST_TRIGGER = <Button label="trigger" />;
const TEST_CONTENT = <div>content</div>;
const TEST_FOOTER = <Button label="button" />;

const triggerId = `#${TRIGGER_PREFIX_ID}-${TEST_ID}`;
const contentId = `#${ELEMENT_PREFIX_ID}-${TEST_ID}`;

describe('StdPopover', () => {
  it('renders the StdPopover with Trigger and Content', () => {
    render(
      <StdPopover id={TEST_ID} show>
        <StdPopover.Trigger>{TEST_TRIGGER}</StdPopover.Trigger>
        <StdPopover.Content>{TEST_CONTENT}</StdPopover.Content>
      </StdPopover>,
    );
    expect(document.querySelector(triggerId)).toBeInTheDocument();
    expect(document.querySelector(triggerId)).toHaveTextContent('trigger');
    expect(document.querySelector(contentId)).toBeInTheDocument();
    expect(document.querySelector(contentId)).toHaveTextContent('content');
  });

  it('renders the StdPopover with Footer when specified', () => {
    render(
      <StdPopover id={TEST_ID} show>
        <StdPopover.Trigger>{TEST_TRIGGER}</StdPopover.Trigger>
        <StdPopover.Content>{TEST_CONTENT}</StdPopover.Content>
        <StdPopover.Footer>{TEST_FOOTER}</StdPopover.Footer>
      </StdPopover>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(document.querySelector(contentId)).toHaveTextContent('button');
  });
});
