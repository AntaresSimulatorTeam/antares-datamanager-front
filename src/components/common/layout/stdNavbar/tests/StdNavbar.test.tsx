import { renderWithStubRoutes } from '@/shared/test/testUtils';
import { screen } from '@testing-library/react';
import StdNavbar, { NavbarConfig } from '../StdNavbar';
import { menuBottomData, menuTopData } from '@/routes.tsx';

const DEFAULT_NAVBAR_TEXT_CONFIG: NavbarConfig<'a'> = {
  header: {
    appName: 'App. RTE',
    appVersion: 'v1.0',
    appTwoLetters: 'AR',
    variant: 'text',
    as: 'a',
    to: '/',
  },
  itemContent: {
    mainText: 'text-gray-800',
    hoverText: 'hover:text-gray-900',
    activeText: 'active:text-gray-900',
    selectedText: '[&]:text-gray-900',
  },
  itemBackground: {
    mainBg: 'bg-gray-50',
    hoverBg: 'hover:bg-gray-300',
    activeBg: 'active:bg-gray-400',
    selectedBg: '[&]:bg-gray-400',
  },
  separatorColor: 'border-gray-700',
  textColor: 'text-gray-800',
};

describe('StdNavbar component', () => {
  it('should render the navbar component with proper role and id, with the correct amount of sub items', async () => {
    await renderWithStubRoutes(
      <StdNavbar
        id={'NAVBAR_APP'}
        topItems={menuTopData}
        bottomItems={menuBottomData}
        config={DEFAULT_NAVBAR_TEXT_CONFIG}
      />,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getAllByRole('link').length).toBe(menuTopData.length + menuBottomData.length);
  });
});
