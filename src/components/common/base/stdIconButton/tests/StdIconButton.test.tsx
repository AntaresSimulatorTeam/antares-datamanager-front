import { render, screen } from '@testing-library/react';

import { noop } from '@/shared/utils/defaultUtils';
import { StdIconId } from '@/shared/utils/mappings/common/iconMaps';
import StdIconButton from '../StdIconButton';

const TEST_ICON = StdIconId.Add;
const TEST_ID = 'my-button';

describe('StdIconButton', () => {
  it('renders the default StdIconButton component with icon', () => {
    render(<StdIconButton icon={TEST_ICON} onClick={noop} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTitle(TEST_ICON)).toBeInTheDocument();
  });

  it('renders the StdIconButton with the proper id when specified', () => {
    render(<StdIconButton id={TEST_ID} icon={TEST_ICON} onClick={noop} />);
    expect(document.querySelector(`#${TEST_ID}`)).toBeInTheDocument();
  });
});
