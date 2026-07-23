import { AppLayoutProps } from '../AppLayout.d';
import Sidebar from '../Sidebar/Sidebar';
import { SidebarProvider } from '../Sidebar/SidebarContext';
import { ScheduleConfigProvider } from '../../../Views/ScheduleConfig/ScheduleConfigContext';
import { RequestsProvider } from '../../../Views/Requests/RequestsContext';
import { SpaceRequestsProvider } from '../../../Views/IAM/SpaceRequestForm/SpaceRequestsContext';

function PrivateLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <ScheduleConfigProvider>
      <RequestsProvider>
        <SpaceRequestsProvider>
          <SidebarProvider>
            <Sidebar />
            {children}
          </SidebarProvider>
        </SpaceRequestsProvider>
      </RequestsProvider>
    </ScheduleConfigProvider>
  );
}

export default PrivateLayout;
