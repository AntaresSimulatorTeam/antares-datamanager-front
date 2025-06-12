import { NavbarConfig } from '@/components/common/layout/stdNavbar/StdNavbar';
import { Context, createContext, Dispatch, ElementType, PropsWithChildren, SetStateAction, useContext } from 'react';
import { AnchorDefaultAsType } from '@common/base/element.type.ts';

type NavbarContextType<E extends ElementType = AnchorDefaultAsType> = {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  config?: NavbarConfig<E>;
};

export const NavbarContext = createContext<NavbarContextType>({
  expanded: false,
  setExpanded: () => {},
});

export const useNavbarContext = <E extends ElementType = AnchorDefaultAsType>() =>
  useContext(NavbarContext as unknown as Context<NavbarContextType<E>>);

export const NavbarContextProvider = <E extends ElementType = AnchorDefaultAsType>({
  children,
  ...props
}: PropsWithChildren<NavbarContextType<E>>) => {
  const LocalNavbarContext = NavbarContext as unknown as Context<NavbarContextType<E>>;
  return <LocalNavbarContext.Provider value={props}>{children}</LocalNavbarContext.Provider>;
};
