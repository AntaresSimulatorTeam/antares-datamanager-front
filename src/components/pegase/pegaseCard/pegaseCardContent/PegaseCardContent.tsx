import StdTagList from '@common/base/StdTagList/StdTagList.tsx';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';
import { avatarCase } from '@/shared/utils/textUtils.ts';
import { ProjectInfo } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { useUserDisplay } from '@/shared/hooks/useUserDisplay';
import { Avatar } from '@design-system-rte/react';

export type PegaseCardContentProps = {
  project: ProjectInfo;
};

export const PegaseCardContent = ({ project }: PegaseCardContentProps) => {
  const { t } = useTranslation();
  const { fullname } = useUserDisplay(project.createdBy);

  return (
    <div className="flex flex-col items-start justify-between">
      <div className="flex items-center gap-1">
        {project.tags && (
          <div className="flex h-3">
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
        <Avatar
          alt={fullname}
          colorType="decorative"
          decorativeColor="vert-foret"
          imgSrc=""
          initials={avatarCase(fullname)}
          layout="initials"
          size={32}
          type="user"
        />
        <span className="text-body-xs font-light text-gray-600">{fullname}</span>
      </div>
    </div>
  );
};
