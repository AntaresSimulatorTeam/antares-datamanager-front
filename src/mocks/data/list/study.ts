/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const STUDY_NAME: string[] = [
  'CreaCode',
  'PixelArt',
  'TechGenie',
  'InnoCréa',
  'WebMerveille',
  'DataMagique',
  'AppMagicien',
  'ByteCréatif',
  'PixelGénial',
  'TechCréation',
  'InnoCréatif',
  'WebCréateur',
  'DataCréatif',
  'AppArchitecte',
  'ByteBrillant',
  'PixelChemin',
  'TechTonique',
  'InnoÉtincelle',
  'WebRapide',
];

export default STUDY_NAME;

export const mockStudy = {
  id: 1,
  name: 'BP_ref_1',
  createdBy: 'Isaac Asimov',
  creationDate: new Date('Janvier 18'),
  keywords: ['covid', 'silence'],
  project: 'Bilan previsionnel 2027',
  status: 'missing',
  horizon: '2020_2024',
  trajectoryIds: [2],
};

export const mockResponseGetStudyApi = {
  content: [
    {
      id: 1,
      name: 'Project 1',
      createdBy: 'User A',
      creationDate: '2023-10-01',
      keywords: ['Keyword1', 'Keyword2'],
      project: '1',
      status: 'IN_PROGRESS',
      horizon: '2030-2031',
      trajectoryIds: [1, 7],
    },
  ],
  totalElements: 1,
};

export const mockResponseSaveStudyApi = {
  id: 1,
  name: 'Project 1',
  createdBy: 'User A',
  keywords: ['Keyword1', 'Keyword2'],
  project: '1',
  horizon: '2030-2031',
  trajectoryIds: [1, 7],
};
