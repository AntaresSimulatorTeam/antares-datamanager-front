import { useEffect, useState } from 'react';
import { AppData } from '@/shared/types/AppInfo.ts';
import { useTranslation } from 'react-i18next';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { RdsHeading } from 'rte-design-system-react';
import { AboutHeaders } from '@/components/header/AboutHeader.tsx';
import { fetchAppInfo } from '@/shared/services/aboutService.ts';

export const About = () => {
  const [info, setInfo] = useState<AppData[] | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setIsLoadingInfo(true);
        const appInfos = await fetchAppInfo();
        setInfo(appInfos);
      } catch (error) {
        console.error('Error fetching info:', error);
      } finally {
        setIsLoadingInfo(false);
      }
    };
    void fetchInfo();
  }, []);

  return (
    <div className="flex h-1/2 w-full flex-col items-start justify-center gap-4 p-3">
      <RdsHeading title={t('about.@title')} />
      {info && !isLoadingInfo ? (
        <div className="w-3/4">
          <StdSimpleTable id="app-data" data={info} columns={AboutHeaders(t)} enableColumnResizing={false} />
        </div>
      ) : (
        <p className="text-gray-500">{t('components.spinner.@label')}</p>
      )}
    </div>
  );
};

export default About;
