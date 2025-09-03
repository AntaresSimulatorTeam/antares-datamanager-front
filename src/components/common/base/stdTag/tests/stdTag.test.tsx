import { noop } from '@/shared/utils/defaultUtils';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { render, screen } from '@testing-library/react';
import StdTag from '../StdTag';

const TEST_LABEL = 'label';
const TEST_ID = 'my-tag';
const TEST_ICON = StdIconId.Close;

describe('StdTag', () => {
  it('renders the default StdTag component with the expected id', () => {
    render(<StdTag label={TEST_LABEL} id={TEST_ID} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });

  it('renders the default StdTag component with the close button', () => {
    render(<StdTag label={TEST_LABEL} id={TEST_ID} onDelete={noop} />);
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });
});
