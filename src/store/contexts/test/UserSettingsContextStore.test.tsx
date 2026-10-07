/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import React, { FC, PropsWithChildren } from 'react';
import { THEME_COLOR, THEME_MODE } from '@/shared/types';
import { getInitialUserSettings, UserSettingsContext, UserSettingsContextStore } from '../UserSettingsContext';

describe('UserSettingsContextStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-theme');
    document.body.removeAttribute('data-mode');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-mode');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-theme');
    document.body.removeAttribute('data-mode');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-mode');
    vi.restoreAllMocks();
  });

  describe('getInitialUserSettings', () => {
    it('retourne les valeurs par défaut si aucun paramètre n’est sauvegardé ni présent dans le DOM', () => {
      const initialSettings = getInitialUserSettings();
      expect(initialSettings).toEqual({
        theme: THEME_COLOR.BLUE_ICEBERG,
        mode: THEME_MODE.LIGHT,
      });
    });

    it('récupère le thème et le mode depuis le localStorage si les valeurs sont valides', () => {
      localStorage.setItem('theme', THEME_COLOR.VERT_FORET);
      localStorage.setItem('mode', THEME_MODE.DARK);

      const initialSettings = getInitialUserSettings();
      expect(initialSettings).toEqual({
        theme: THEME_COLOR.VERT_FORET,
        mode: THEME_MODE.DARK,
      });
    });

    it('ignore les valeurs invalides dans le localStorage et utilise les valeurs par défaut', () => {
      localStorage.setItem('theme', 'invalid_theme');
      localStorage.setItem('mode', 'invalid_mode');

      const initialSettings = getInitialUserSettings();
      expect(initialSettings).toEqual({
        theme: THEME_COLOR.BLUE_ICEBERG,
        mode: THEME_MODE.LIGHT,
      });
    });

    it('gère les erreurs d’accès à localStorage sans planter', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const initialSettings = getInitialUserSettings();
      expect(initialSettings).toEqual({
        theme: THEME_COLOR.BLUE_ICEBERG,
        mode: THEME_MODE.LIGHT,
      });
    });

    it('récupère le thème et le mode depuis les attributs data-* de document.body si absent de localStorage', () => {
      document.body.setAttribute('data-theme', THEME_COLOR.VIOLET);
      document.body.setAttribute('data-mode', THEME_MODE.DARK);

      const initialSettings = getInitialUserSettings();
      expect(initialSettings).toEqual({
        theme: THEME_COLOR.VIOLET,
        mode: THEME_MODE.DARK,
      });
    });

    it('récupère le thème et le mode depuis document.documentElement si absents de body et localStorage', () => {
      document.documentElement.setAttribute('data-theme', THEME_COLOR.VERT_FORET);
      document.documentElement.setAttribute('data-mode', THEME_MODE.DARK);

      const initialSettings = getInitialUserSettings();
      expect(initialSettings).toEqual({
        theme: THEME_COLOR.VERT_FORET,
        mode: THEME_MODE.DARK,
      });
    });

    it('ignore les attributs data-* invalides du DOM et utilise les valeurs par défaut', () => {
      document.body.setAttribute('data-theme', 'unknown_color');
      document.body.setAttribute('data-mode', 'unknown_mode');

      const initialSettings = getInitialUserSettings();
      expect(initialSettings).toEqual({
        theme: THEME_COLOR.BLUE_ICEBERG,
        mode: THEME_MODE.LIGHT,
      });
    });

    it('donne la priorité au localStorage par rapport au DOM', () => {
      localStorage.setItem('theme', THEME_COLOR.VERT_FORET);
      localStorage.setItem('mode', THEME_MODE.LIGHT);
      document.body.setAttribute('data-theme', THEME_COLOR.VIOLET);
      document.body.setAttribute('data-mode', THEME_MODE.DARK);

      const initialSettings = getInitialUserSettings();
      expect(initialSettings).toEqual({
        theme: THEME_COLOR.VERT_FORET,
        mode: THEME_MODE.LIGHT,
      });
    });
  });

  describe('UserSettingsContext', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <UserSettingsContext.Provider initialState={{ theme: THEME_COLOR.BLUE_ICEBERG, mode: THEME_MODE.LIGHT }}>
        {children}
      </UserSettingsContext.Provider>
    );

    it('fournit l’état initial via useStore', () => {
      const { result } = renderHook(() => UserSettingsContext.useStore((state) => state), { wrapper });

      expect(result.current).toEqual({
        theme: THEME_COLOR.BLUE_ICEBERG,
        mode: THEME_MODE.LIGHT,
      });
    });

    it('permet de mettre à jour le store avec un objet via useSetStore', () => {
      const { result } = renderHook(
        () => ({
          theme: UserSettingsContext.useStore((state) => state.theme),
          mode: UserSettingsContext.useStore((state) => state.mode),
          setStore: UserSettingsContext.useSetStore(),
        }),
        { wrapper },
      );

      act(() => {
        result.current.setStore({ theme: THEME_COLOR.VIOLET, mode: THEME_MODE.DARK });
      });

      expect(result.current.theme).toBe(THEME_COLOR.VIOLET);
      expect(result.current.mode).toBe(THEME_MODE.DARK);
    });

    it('permet de mettre à jour le store avec une fonction updater via useSetStore', () => {
      const { result } = renderHook(
        () => ({
          theme: UserSettingsContext.useStore((state) => state.theme),
          setStore: UserSettingsContext.useSetStore(),
        }),
        { wrapper },
      );

      act(() => {
        result.current.setStore((draft) => {
          draft.theme = THEME_COLOR.VERT_FORET;
        });
      });

      expect(result.current.theme).toBe(THEME_COLOR.VERT_FORET);
    });

    it('permet de réinitialiser le contexte via useResetContext', () => {
      const { result } = renderHook(
        () => ({
          settings: UserSettingsContext.useStore((state) => state),
          setStore: UserSettingsContext.useSetStore(),
          resetContext: UserSettingsContext.useResetContext(),
        }),
        { wrapper },
      );

      act(() => {
        result.current.setStore({ theme: THEME_COLOR.VIOLET });
      });
      expect(result.current.settings?.theme).toBe(THEME_COLOR.VIOLET);

      act(() => {
        result.current.resetContext();
      });

      expect(result.current.settings).toEqual({});
    });

    it('nettoie les champs spécifiés au démontage avec useClearOnDestroy', () => {
      const ConsumerWithClear: FC<{ clearKey: keyof UserSettingsContextStore }> = ({ clearKey }) => {
        UserSettingsContext.useClearOnDestroy(clearKey);
        return <div data-testid="consumer">Consumer</div>;
      };

      const DisplaySettings: FC = () => {
        const theme = UserSettingsContext.useStore((state) => state.theme);
        const mode = UserSettingsContext.useStore((state) => state.mode);
        return (
          <div>
            <span data-testid="theme">{theme ?? 'undefined'}</span>
            <span data-testid="mode">{mode ?? 'undefined'}</span>
          </div>
        );
      };

      const { unmount } = render(
        <UserSettingsContext.Provider initialState={{ theme: THEME_COLOR.VIOLET, mode: THEME_MODE.DARK }}>
          <DisplaySettings />
          <ConsumerWithClear clearKey="theme" />
        </UserSettingsContext.Provider>,
      );

      expect(screen.getByTestId('theme').textContent).toBe(THEME_COLOR.VIOLET);
      expect(screen.getByTestId('mode').textContent).toBe(THEME_MODE.DARK);

      unmount();
    });
  });
});
