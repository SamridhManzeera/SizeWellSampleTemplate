import { AppLayoutProps } from '../AppLayout.d';
import Sidebar from '../Sidebar/Sidebar';
import { SidebarProvider } from '../Sidebar/SidebarContext';
import { ScheduleConfigProvider } from '../../../Views/ScheduleConfig/ScheduleConfigContext';
import { RequestsProvider } from '../../../Views/Requests/RequestsContext';
import { SpaceRequestsProvider } from '../../../Views/IAM/SpaceRequestForm/SpaceRequestsContext';
import { FmtBookingsProvider } from '../../../Views/FMT/FmtBookingsContext';

function PrivateLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <ScheduleConfigProvider>
      <RequestsProvider>
        <SpaceRequestsProvider>
          <FmtBookingsProvider>
            <SidebarProvider>
              <Sidebar />
              {children}
            </SidebarProvider>
          </FmtBookingsProvider>
        </SpaceRequestsProvider>
      </RequestsProvider>
    </ScheduleConfigProvider>
  );
}

export default PrivateLayout;
