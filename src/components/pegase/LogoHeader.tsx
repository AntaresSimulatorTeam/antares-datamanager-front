import { UserSettingsContext } from '@/store/contexts/UserSettingsContext.tsx';
import { THEME_MODE } from '@/shared/types';

export const LogoHeader = ({ version, isCollapsed }: { version: string; isCollapsed: boolean }) => {
  const mode = UserSettingsContext.useStore((store) => store.mode);

  const isDark = mode === THEME_MODE.DARK;
  const variant = isDark ? 'light' : 'dark';
  const state = isCollapsed ? 'collapse' : 'expand';

  const imgSrc = `/brand/logo_antares_pegase_${variant}_${state}.svg`;
  const paddingX = isCollapsed ? 'px-0' : 'px-2';

  return (
    <div className={`flex flex-col items-start gap-1 ${paddingX}`}>
      <img alt="logo-antares" src={imgSrc} />
      <span className="text-body-xs self-end">{version}</span>
    </div>
  );
};