import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import StudyHeader from './studyHeader';
import StudyDetailsContent from './StudyDetailsContent';
import { RdsDivider } from 'rte-design-system-react';
import StudyNavigationMenu from "@/pages/pegase/studies/studyDetails/StudyNavigationMenu";

const StudyDetails = () => {
  const [activeContent, setActiveContent] = useState<React.ReactNode>(null);
  const location = useLocation();
  const { study } = location.state || {};

  return !study.id ? (
      <div className="flex h-screen items-center justify-center">
        <p>Loading project details...</p>
      </div>
  ) : (
      <div className="flex flex-col">
        <StudyHeader projectName={study.project} studyName={study.name} createdBy={study.createdBy} />
        <RdsDivider />
        <div className="flex flex-col">
          <StudyDetailsContent study={study} />
        </div>
        <div className="flex gap-4 px-3 py-2">
            <div className="flex h-10 items-end self-stretch">
              <StudyNavigationMenu onRenderActiveComponent={setActiveContent} />
            </div>
        </div>
        <div className="flex space-x-4 p-4">
          {activeContent}
        </div>
      </div>
  );
};

export default StudyDetails;
