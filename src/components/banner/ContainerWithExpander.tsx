import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar.tsx';
import { VirtualizerList } from '@/components/list/VirtualizerList.tsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardWithIconTitle } from '@common/layout/CardWithIconTitle.tsx';
import { convertDataToItem } from '@/shared/utils/warningUtils.ts';

interface Props<T> {
  content: T[];
  placeholder: string;
}

export const ContainerWithExpander = <T,>({ content, placeholder }: Props<T>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(content?.length > 0);

  useEffect(() => {
    setIsOpen(content?.length !== 0);
  }, [content?.length]);

  return (
    <div
      className={`flex ${isOpen && content?.length > 0 ? 'aspect-medium:h-1/5 aspect-wide:h-[210px]' : 'h-fit'} w-full shrink-0 rounded border-gray-600 bg-gray-200 px-2 pb-1 pt-0.5 shadow-2`}
    >
      <div className="flex w-full max-w-fit flex-col pt-2 sm:pt-1.5">
        <button onClick={() => setIsOpen((prev) => !prev)}>
          <StdIcon name={isOpen ? StdIconId.KeyboardArrowUp : StdIconId.KeyboardArrowDown} />
        </button>
      </div>
      <div className="flex h-full w-full flex-col items-center">
        <div className="flex w-full items-center gap-4 px-2 sm:gap-2 sm:p-1">
          {content?.length > 0 && (
            <StdAvatar
              initials={`${content?.length ?? '0'}`}
              size="es"
              backgroundColor={content?.length === 0 ? 'gray' : 'orange'}
              fullname=""
              textColor="white"
              hasToolTip={false}
            />
          )}
          <span className="text-body-m">{t('studyDetails.@warnings')}</span>
        </div>
        {content.length > 0 && isOpen && (
          <VirtualizerList
            isOpen={isOpen}
            items={content}
            renderItem={(contentItem, size, transform, key) => (
              <CardWithIconTitle key={key} data={convertDataToItem(contentItem, t)} size={size} transform={transform} />
            )}
          />
        )}
        {content.length === 0 && isOpen && <div className="mb-2 text-body-s text-gray-600">{placeholder}</div>}
      </div>
    </div>
  );
};
