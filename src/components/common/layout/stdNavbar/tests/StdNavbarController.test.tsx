import { noop } from '@/shared/utils/defaultUtils';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { render, screen } from '@testing-library/react';
import { ItemBackgroundStyleConfig, ItemStyleConfig } from '../StdNavbar';
import StdNavbarController from '../StdNavbarController';

const TEST_LABEL = 'Controls';

const DEFAULT_CONFIG = {
  itemBackground: {
    mainBg: 'bg-gray-50',
    hoverBg: 'hover:bg-gray-200',
    activeBg: 'active:bg-gray-300',
    selectedBg: '[&]:bg-gray-300',
  },
  itemContent: {
    mainText: 'text-gray-700',
    hoverText: 'hover:text-gray-900',
    activeText: 'active:text-gray-900',
    selectedText: '[&]:text-gray-900',
  },
} as { itemBackground: ItemBackgroundStyleConfig; itemContent: ItemStyleConfig };

describe('StdNavbarController component', () => {
  it('should render the proper content when expanded', () => {
    render(
      <StdNavbarController
        label={TEST_LABEL}
        action={noop}
        expanded
        itemsStyleConfig={DEFAULT_CONFIG}
        id={'pegase-controller'}
      />,
    );
    expect(screen.getByTitle(StdIconId.KeyboardDoubleArrowLeft)).toBeInTheDocument();
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
  });
  it('should render the proper content when expanded is false', () => {
    render(
      <StdNavbarController
        label={TEST_LABEL}
        action={noop}
        expanded={false}
        itemsStyleConfig={DEFAULT_CONFIG}
        id={'pegase-controller'}
      />,
    );
    expect(screen.getByTitle(StdIconId.KeyboardDoubleArrowRight)).toBeInTheDocument();
    expect(screen.queryByText(TEST_LABEL)).toBeInTheDocument();
  });
});
