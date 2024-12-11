import { getEnvVariables } from '@/envVariables';

const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
export const searchStudy = async (sortBy: { [key: string]: 'asc' | 'desc' }) => {
  const sortParams = Object.entries(sortBy)
    .map(([key, order]) => `${key},${order}`)
    .join('&sort=');

  const response = await fetch(
    // axios
    `${BASE_URL}/v1/study/search?page=${current + 1}&size=${intervalSize}&projectId=${projectId}&search=${searchStudy}&sort=${sortParams}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch project details');
  }
  const json: unknown = await response.json();
  const studyDTOSchema = z.object(...StudyDTO);

  const studyRequestSchema = z.object({
    content: studyDTOSchema,
    totalElements: z.number(),
  });

  if (studyRequestSchema.parse(json)) {
    return { rows: json.content, totalElements: json.totalElements };
  }
};
