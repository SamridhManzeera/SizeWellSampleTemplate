import { useSelector } from 'react-redux';
import { useRoutes } from 'react-router-dom';
import DocumentTitle from './DocumentTitle';
import { getAuthenticatedRoutes, guestRoutes } from './config';
import AppLayout from '../Components/Layouts/AppLayout';
import type { RootState } from '../Store';

function RootRouter() {
  const guest = useRoutes(guestRoutes);
  const token = useSelector((state: RootState) => state?.common?.token);
  const projecttype = useSelector(
    (state: RootState) => state?.common?.projecttype
  );
  const authenticated = useRoutes(getAuthenticatedRoutes(projecttype));
  const isAuthenticated = !!token;
  return (
    <>
      <DocumentTitle
        isAuthenticated={isAuthenticated}
        projecttype={projecttype}
      />
      <AppLayout isAuthenticated={isAuthenticated}>
        {token ? authenticated : guest}
      </AppLayout>
    </>
  );
}

export default RootRouter;
