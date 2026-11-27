/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, render, screen } from '@testing-library/react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { createInstance, type i18n } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { CellWithStatus } from '@/components/common/data/CellWithStatus.tsx';
import { StudyStatusCell } from '@/components/common/data/StudyStatusCell.tsx';
import getStudyTableHeaders from '@/components/header/StudyTableHeaders.tsx';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { type StudyDTO } from '@/shared/types/Study.type.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

vi.mock('@design-system-rte/react', async (importOriginal) => {
  const original = await importOriginal<typeof import('@design-system-rte/react')>();
  return {
    ...original,
    Icon: ({ name, color }: { name: string; color: string }) => (
      <span data-testid="status-icon" data-name={name} data-color={color} />
    ),
  };
});

const study: StudyDTO = {
  id: 1,
  name: 'Study',
  createdBy: undefined,
  creationDate: new Date('2024-01-01'),
  keywords: [],
  project: 'Project',
  projectId: '1',
  status: StudyStatus.GENERATED,
  horizon: '2030',
  trajectoryIds: [],
  hvdc: false,
  recalculate: false,
};

const StudyTableStatus = () => {
  const table = useReactTable({
    data: [study],
    columns: getStudyTableHeaders((key) => key),
    getCoreRowModel: getCoreRowModel(),
  });
  const cell = table.getRowModel().rows[0].getVisibleCells().find((item) => item.column.id === 'status');

  return cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null;
};

describe('useStatusIcons', () => {
  let i18n: i18n;

  beforeEach(async () => {
    i18n = createInstance();
    await i18n.use(initReactI18next).init({
      lng: 'en',
      resources: {
        en: { translation: { studyDetails: {
          '@import_status_done': 'Done',
          '@import_status_missing': 'Missing',
          '@import_status_error': 'Error',
        } } },
        fr: { translation: { studyDetails: {
          '@import_status_done': 'Terminé',
          '@import_status_missing': 'Manquant',
          '@import_status_error': 'Erreur',
        } } },
      },
    });
  });

  const renderWithTranslations = (element: React.ReactElement) =>
    render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);

  it.each([
    [TRAJECTORY_SELECTION_STATUS.OK, 'check', 'var(--status-available)', 'Done'],
    [TRAJECTORY_SELECTION_STATUS.MISSING, 'question-mark', 'var(--status-away)', 'Missing'],
    [TRAJECTORY_SELECTION_STATUS.ERROR, 'info', 'var(--status-busy)', 'Error'],
    ['unknown' as TRAJECTORY_SELECTION_STATUS, 'question-mark', 'var(--status-away)', 'Missing'],
  ])('renders trajectory status %s', (status, name, color, label) => {
    renderWithTranslations(<CellWithStatus status={status} />);

    expect(screen.getByTestId('status-icon')).toHaveAttribute('data-name', name);
    expect(screen.getByTestId('status-icon')).toHaveAttribute('data-color', color);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([
    [StudyStatus.GENERATED, 'download-done', 'var(--status-available)', 'Generated'],
    [StudyStatus.ERROR, 'error', 'var(--status-busy)', 'Error'],
    [StudyStatus.GENERATION_IN_PROGRESS, 'settings', 'var(--status-away)', 'Generation in progress'],
    [StudyStatus.IN_PROGRESS, 'trending-up', '#1465FC', 'In progress'],
    ['unknown' as StudyStatus, 'trending-up', '#1465FC', 'Unknown'],
  ])('renders study status %s', (status, name, color, label) => {
    renderWithTranslations(<StudyStatusCell status={status} />);

    expect(screen.getByTestId('status-icon')).toHaveAttribute('data-name', name);
    expect(screen.getByTestId('status-icon')).toHaveAttribute('data-color', color);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('updates trajectory labels when the language changes', async () => {
    renderWithTranslations(<CellWithStatus status={TRAJECTORY_SELECTION_STATUS.OK} />);
    expect(screen.getByText('Done')).toBeInTheDocument();

    await act(() => i18n.changeLanguage('fr'));

    expect(screen.getByText('Terminé')).toBeInTheDocument();
  });

  it('renders the study status through the table column', () => {
    renderWithTranslations(<StudyTableStatus />);

    expect(screen.getByTestId('status-icon')).toHaveAttribute('data-name', 'download-done');
    expect(screen.getByTestId('status-icon')).toHaveAttribute('data-color', 'var(--status-available)');
    expect(screen.getByText('Generated')).toBeInTheDocument();
  });
});
