import { PropsWithChildren } from 'react';

const StdPopoverFooter = ({ children }: PropsWithChildren) => (
  <footer className="flex justify-end" role="group">
    {children}
  </footer>
);

export default StdPopoverFooter;
