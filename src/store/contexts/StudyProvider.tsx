import { ReactNode, Reducer, useCallback, useMemo, useReducer } from 'react';
import { LocationStudy, StudyActionType, StudyState } from '@/shared/types';
import { studyReducer } from '@/store/reducers/studyReducer.tsx';
import { StudyContext, StudyDispatchContext } from '@/store/contexts/StudyContext';
import { useLocation } from 'react-router-dom';
import { discardWarningMessage } from '@/shared/services/messagesWarningService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export interface StudyProviderProps {
  children: ReactNode;
}

export const StudyProvider = ({ children }: StudyProviderProps) => {
  const location = useLocation();
  const study = (location.state as LocationStudy)?.study;
  const [state, dispatch] = useReducer<Reducer<StudyState, StudyActionType>>(studyReducer, {
    studyStatus: study?.status,
  });

  const handleDiscardWarningMessage = useCallback(
    async (id: number, trajectoryType: TRAJECTORY_TYPE, studyId: number): Promise<void> => {
      try {
        await discardWarningMessage(id, trajectoryType, studyId, dispatch);
        dispatch({ type: STUDY_ACTION.SKIP_MESSAGE, payload: { discardActionTriggered: true } });
      } catch (error) {
        console.error('Failed to discard warning message:', error);
      }
    },
    [dispatch],
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      discardWarningMessage: handleDiscardWarningMessage,
    }),
    [state, handleDiscardWarningMessage],
  );

  return (
    <StudyContext.Provider value={contextValue}>
      <StudyDispatchContext.Provider value={dispatch}>{children}</StudyDispatchContext.Provider>
    </StudyContext.Provider>
  );
};
