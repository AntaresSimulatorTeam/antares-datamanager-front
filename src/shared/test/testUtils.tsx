import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { createRoutesStub, InitialEntry } from 'react-router-dom';
import { menuTopData } from '@/routes.tsx';

export const renderWithStubRoutes = async (ComponentIU: React.ReactElement) => {
  const entries = menuTopData.map((itemMenu) => ({ path: itemMenu.path, Component: () => ComponentIU }));
  const ComponentIUStub = createRoutesStub(entries);
  await waitFor(() => {
    render(<ComponentIUStub initialEntries={[entries.map((item) => item.path)] as InitialEntry[]} />);
  });
};
