import { screen } from '@testing-library/react';
import { menuTopData } from '@/routes';
import { renderWithStubRoutes } from '@/shared/test/testUtils.tsx';
import StdNavbarMenu from '@common/layout/stdNavbar/StdNavbarMenu.tsx';

describe('StdNavbarMenu component', () => {
  it('should render the component with the proper amount of items', async () => {
    await renderWithStubRoutes(<StdNavbarMenu menuItems={menuTopData} />);
    expect(screen.getAllByRole('link').length).toBe(menuTopData.length);
    for (const item of menuTopData) {
      expect(screen.getByTitle(item.icon)).toBeInTheDocument();
    }
  });
  it('should display the labels when expanded is true', async () => {
    await renderWithStubRoutes(<StdNavbarMenu menuItems={menuTopData} />);
    for (const item of menuTopData) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });
});
