import { UserSettingsContext } from '@/store/contexts/UserSettingsContext.tsx';
import { THEME_MODE } from '@/shared/types';
import { useEffect, useState } from 'react';

export const LogoHeader = ({version, isCollapsed}: {version: string, isCollapsed: boolean}) => {
  const mode = UserSettingsContext.useStore((store) => store.mode);
  const [imgSrc, setImgSrc] = useState<string>("brand/logo_antares_pegase_dark_expand.svg");

  useEffect(() => {
    if (mode === THEME_MODE.DARK && isCollapsed) {
      setImgSrc("brand/logo_antares_pegase_light_collapse.svg");
    } else if (mode === THEME_MODE.DARK && !isCollapsed) {
      setImgSrc("brand/logo_antares_pegase_light_expand.svg");
    } else if (mode === THEME_MODE.LIGHT && isCollapsed) {
      setImgSrc("brand/logo_antares_pegase_dark_collapse.svg");
    } else if (mode === THEME_MODE.LIGHT && !isCollapsed) {
      setImgSrc("brand/logo_antares_pegase_dark_expand.svg");
    }
  }, [mode, isCollapsed]);

    return (
      <div className="flex flex-col items-start gap-1 px-2"><img alt="logo-antares" src={imgSrc}/><span className="text-body-xs self-end">{version}</span></div>
    );
}