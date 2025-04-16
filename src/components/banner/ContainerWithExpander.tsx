import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar.tsx';
import { RdsHeading } from 'rte-design-system-react';
import { VirtualizerList } from '@/components/list/VirtualizerList.tsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardWithIconTitle } from '@common/layout/CardWithIconTitle.tsx';
import { convertDataToItem } from '@/shared/utils/warningUtils.ts';

interface Props<T> {
  content: T[] | null;
}

export const ContainerWithExpander = <T,>({ content }: Props<T>) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const color = content?.length === 0 ? 'gray' : 'orange';

  return (
    <div className="flex w-full rounded border-gray-600 bg-gray-200 pl-2 shadow-2 sm:pl-1">
      <div className="flex w-full max-w-fit flex-col pt-3 sm:pt-2">
        <button onClick={() => setIsOpen((prev) => !prev)}>
          <StdIcon name={isOpen ? StdIconId.KeyboardArrowUp : StdIconId.KeyboardArrowDown} />
        </button>
      </div>
      <div className="flex w-full flex-col">
        <div className="flex">
          <div className="flex w-full items-center gap-4 p-2 sm:gap-2 sm:p-1">
            <StdAvatar
              initials={`${content?.length ?? '0'}`}
              size="es"
              backgroundColor={color}
              fullname=""
              textColor="white"
            />
            <RdsHeading title={t('studyDetails.@alerts')} size="m" />
          </div>
        </div>
        {!!content?.length && isOpen && (
          <VirtualizerList
            isOpen={isOpen}
            items={content}
            renderItem={(contentItem, size, transform) => (
              <CardWithIconTitle data={convertDataToItem(contentItem, t)} size={size} transform={transform} />
            )}
          />
        )}
      </div>
    </div>
  );
};
