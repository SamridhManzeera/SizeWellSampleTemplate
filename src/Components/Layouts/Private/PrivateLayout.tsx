import { AppLayoutProps } from '../AppLayout.d';
import Sidebar from '../Sidebar/Sidebar';
import { SidebarProvider } from '../Sidebar/SidebarContext';
import { ScheduleConfigProvider } from '../../../Views/ScheduleConfig/ScheduleConfigContext';
import { RequestsProvider } from '../../../Views/Requests/RequestsContext';
import { SpaceRequestsProvider } from '../../../Views/IAM/SpaceRequestForm/SpaceRequestsContext';
import { ReviewerRequestsProvider } from '../../../Views/IAM/Reviewer/ReviewerRequestsContext';

function PrivateLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <ScheduleConfigProvider>
      <RequestsProvider>
        <SpaceRequestsProvider>
          <ReviewerRequestsProvider>
            <SidebarProvider>
              <Sidebar />
              {children}
            </SidebarProvider>
          </ReviewerRequestsProvider>
        </SpaceRequestsProvider>
      </RequestsProvider>
    </ScheduleConfigProvider>
  );
}

export default PrivateLayout;
