import { AppLayoutProps } from '../AppLayout.d';
import Sidebar from '../Sidebar/Sidebar';
import { SidebarProvider } from '../Sidebar/SidebarContext';
import { ScheduleConfigProvider } from '../../../Views/ScheduleConfig/ScheduleConfigContext';
import { RequestsProvider } from '../../../Views/Requests/RequestsContext';

function PrivateLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <ScheduleConfigProvider>
      <RequestsProvider>
        <SidebarProvider>
          <Sidebar />
          {children}
        </SidebarProvider>
      </RequestsProvider>
    </ScheduleConfigProvider>
  );
}

export default PrivateLayout;
