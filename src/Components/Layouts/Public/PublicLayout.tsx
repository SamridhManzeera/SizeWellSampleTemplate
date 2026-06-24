import { AppLayoutProps } from '../AppLayout.d';
import Sidebar from '../Sidebar/Sidebar';
import { SidebarProvider } from '../Sidebar/SidebarContext';
import { ScheduleConfigProvider } from '../../../Views/ScheduleConfig/ScheduleConfigContext';

function PublicLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <ScheduleConfigProvider>
      <SidebarProvider>
        <Sidebar />
        {children}
      </SidebarProvider>
    </ScheduleConfigProvider>
  );
}

export default PublicLayout;
