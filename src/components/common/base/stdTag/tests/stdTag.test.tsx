import { render } from '@testing-library/react';
import StdTag from '../StdTag';

const TEST_LABEL = 'label';
const TEST_ID = 'my-tag';

describe('StdTag', () => {
  it('renders the default StdTag component with the expected id', () => {
    render(<StdTag label={TEST_LABEL} id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });
});
