/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { notifyToast } from '@/shared/notification/notification';
import { getEnvVariables } from '@/envVariables';

interface StudyData {
  name: string;
  createdBy: string;
  keywords: string[];
  project: string;
  horizon: string;
  trajectoryIds: number[];
}
const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');

export const saveStudy = async (studyData: StudyData, toggleModal: () => void) => {
  try {
    const response = await fetch(`${BASE_URL}/v1/study`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studyData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      const errorData = JSON.parse(errorText);
      throw new Error(`${errorData.message || errorText}`);
    }
    notifyToast({
      type: 'success',
      message: 'Study created successfully',
    });
    toggleModal();
  } catch (error: any) {
    notifyToast({
      type: 'error',
      message: `${error.message}`,
    });
  }
};
export const fetchSuggestedKeywords = async (query: string): Promise<string[]> => {
  const response = await fetch(`${BASE_URL}/v1/study/keywords/search?partialName=${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch suggested keywords');
  }
  const data = await response.json();
  return data;
};

export const deleteStudy = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/v1/study/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    notifyToast({
      type: 'success',
      message: 'Study deleted successfully',
    });
  } catch (error: any) {
    notifyToast({
      type: 'error',
      message: `${error.message}`,
    });
  }
};
