import { AppLayoutProps } from '../AppLayout.d';
import Sidebar from '../Sidebar/Sidebar';
import { SidebarProvider } from '../Sidebar/SidebarContext';

function PublicLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <Sidebar />
      {children}
    </SidebarProvider>
  );
}

export default PublicLayout;
