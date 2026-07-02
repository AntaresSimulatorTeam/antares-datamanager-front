import { VirtualizerList } from '@/components/list/VirtualizerList.tsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardWithIconTitle } from '@common/layout/CardWithIconTitle.tsx';
import { convertDataToItem } from '@/shared/utils/warningUtils.ts';
import { Icon, IconButton } from '@design-system-rte/react';

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
      className={`flex w-full shrink-0 rounded border-gray-600 bg-gray-200 px-2 pb-1 pt-0.5 shadow-2 ${
        isOpen && content?.length > 0 ? 'h-40 aspect-medium:h-1/3 aspect-wide:h-[230px]' : 'h-fit'
      } `}
    >
      <div className="flex w-full max-w-fit flex-col pt-2 sm:pt-1.5">
        <IconButton
          appearance="outlined"
          aria-label="icon button aria label"
          name={isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'}
          onClick={() => setIsOpen((prev) => !prev)}
          size="s"
          variant="transparent"
        />
      </div>
      <div className="flex h-full w-full flex-col items-center">
        <div className="flex w-full items-center gap-2 px-2 sm:gap-1 sm:p-1">
          <Icon name="warning"></Icon>
          <span className="text-body-m">{t('studyDetails.@warnings')}</span>
        </div>
        {isOpen && content.length > 0 && (
          <div className="w-full flex-grow overflow-y-auto">
            <VirtualizerList
              isOpen={isOpen}
              items={content}
              renderItem={(contentItem, size, transform, key) => (
                <CardWithIconTitle
                  key={key}
                  data={convertDataToItem(contentItem, t)}
                  size={size}
                  transform={transform}
                />
              )}
            />
          </div>
        )}
        {content.length === 0 && isOpen && <div className="mb-2 text-body-s text-gray-600">{placeholder}</div>}
      </div>
    </div>
  );
};
