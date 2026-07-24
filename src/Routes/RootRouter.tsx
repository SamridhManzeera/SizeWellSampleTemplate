import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useRoutes } from 'react-router-dom';
import DocumentTitle from './DocumentTitle';
import { getAuthenticatedRoutes, guestRoutes } from './config';
import AppLayout from '../Components/Layouts/AppLayout';
import { useVerifyTokenMutation } from '../Services/Api/module/authApi';
import type { RootState } from '../Store';

function RootRouter() {
  const guest = useRoutes(guestRoutes);
  const token = useSelector((state: RootState) => state?.common?.token);
  const projecttype = useSelector(
    (state: RootState) => state?.common?.projecttype
  );
  const authenticated = useRoutes(getAuthenticatedRoutes(projecttype));
  const isAuthenticated = !!token;
  const { pathname } = useLocation();
  const [verifyToken] = useVerifyTokenMutation();

  useEffect(() => {
    if (isAuthenticated) {
      verifyToken({ projecttype });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isAuthenticated]);

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
