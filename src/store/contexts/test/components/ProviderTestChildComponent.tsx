import { useStudy } from '@/store/contexts/StudyContext.tsx';

export const ProviderTestChildComponent = () => {
  const studyState = useStudy();
  console.log('=================== studyState', studyState);
  return (
    <>
      <p data-testid="study-generated">{JSON.stringify(studyState?.isStudyGenerated)}</p>
      <p data-testid="area-trajectory">{studyState?.AREA?.trajectoryName}</p>
    </>
  );
};
