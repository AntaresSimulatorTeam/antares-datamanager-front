import StdTagList from '@common/base/StdTagList/StdTagList.tsx';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar.tsx';
import { avatarCase } from '@/shared/utils/textUtils.ts';
import { ProjectResponse } from '@/shared/types';
import { useTranslation } from 'react-i18next';

export type PegaseCardContentProps = {
  project: ProjectResponse;
};

export const PegaseCardContent = ({ project }: PegaseCardContentProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-start justify-between">
      <div className="flex items-center gap-1">
        {project.tags && (
          <div className="flex h-3 w-32">
            <StdTagList id={`${project.id}-tag-list`} tags={project.tags} maxVisibleTags={12} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-x-0.5 pt-2.5">
        <div className="text-body-xs font-light text-gray-600">
          {`${t('project.@created')}: `}
          <span className="text-body-xs font-medium">{formatDateToDDMMYYYY(project.creationDate)} </span>
          <span className="ml-2">{`${t('project.@by')}: `}</span>
        </div>
        <StdAvatar
          size="es"
          backgroundColor="green"
          fullname={project.createdBy}
          initials={avatarCase(project.createdBy)}
          textColor="primary"
        />
        <span className="text-body-xs font-light text-gray-600">{project.createdBy}</span>
      </div>
    </div>
  );
};
