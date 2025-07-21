import { menuTopData } from '@/routes';
import { renderWithStubRoutes } from '@/shared/test/testUtils';
import { screen } from '@testing-library/react';
import { ItemBackgroundStyleConfig, ItemStyleConfig } from '../StdNavbar';
import StdNavbarMenuItem from '../StdNavbarMenuItem';

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

describe('StdNavbarMenuItem component', () => {
  it('should render the component with the default behavior and proper id', async () => {
    await renderWithStubRoutes(<StdNavbarMenuItem item={menuTopData[0]} itemsStyleConfig={DEFAULT_CONFIG} />);
    expect(document.querySelector(`#${menuTopData[0].id}`)).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByTitle(menuTopData[0].icon)).toBeInTheDocument();
  });
  it('should render the item label if expanded is true', async () => {
    await renderWithStubRoutes(<StdNavbarMenuItem item={menuTopData[0]} expanded itemsStyleConfig={DEFAULT_CONFIG} />);
    expect(screen.getByText(menuTopData[0].label)).toBeInTheDocument();
  });
  it('should render the item label if expanded is not true', async () => {
    await renderWithStubRoutes(
      <StdNavbarMenuItem item={menuTopData[0]} expanded={false} itemsStyleConfig={DEFAULT_CONFIG} />,
    );
    expect(screen.queryByText(menuTopData[0].label)).toBeInTheDocument();
  });
});
