import { ReactNode } from 'react';
import { AppLayoutProps } from '../AppLayout.d';

function PublicLayout({ children }: AppLayoutProps): ReactNode {
  return children;
}

export default PublicLayout;
