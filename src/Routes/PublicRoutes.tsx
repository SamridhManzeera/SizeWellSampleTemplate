import { Navigate } from 'react-router-dom';
import { ROUTES_CONFIG, WILDCARD_ROUTES } from '../Shared/Constants';
import BookingSchedule from '../Views/BookingSchedule';
import ScheduleConfig from '../Views/ScheduleConfig/ScheduleConfig';
import Requests from '../Views/Requests/Requests';
import RequestForm from '../Views/Requests/RequestForm';
import LoginV1 from '../Views/Login/LoginV1';
import LoginV2 from '../Views/Login/LoginV2';
import LoginV3 from '../Views/Login/LoginV3';
import { CustomRouter } from './RootRoutes';

// eslint-disable-next-line import/prefer-default-export
export const PUBLIC_ROUTES: Array<CustomRouter> = [
  {
    path: ROUTES_CONFIG.HOMEPAGE.path,
    element: <BookingSchedule />,
    title: ROUTES_CONFIG.HOMEPAGE.title,
  },
  {
    path: ROUTES_CONFIG.SCHEDULE_CONFIG.path,
    element: <ScheduleConfig />,
    title: ROUTES_CONFIG.SCHEDULE_CONFIG.title,
  },
  {
    path: ROUTES_CONFIG.REQUESTS.path,
    element: <Requests />,
    title: ROUTES_CONFIG.REQUESTS.title,
  },
  // /requests/apply must come before /requests/:id so it isn't caught by the param route
  {
    path: ROUTES_CONFIG.REQUESTS_APPLY.path,
    element: <RequestForm />,
    title: ROUTES_CONFIG.REQUESTS_APPLY.title,
  },
  {
    path: ROUTES_CONFIG.REQUESTS_VIEW.path,
    element: <RequestForm />,
    title: ROUTES_CONFIG.REQUESTS_VIEW.title,
  },
  {
    path: ROUTES_CONFIG.LOGIN.path,
    title: ROUTES_CONFIG.LOGIN.title,
    element: <LoginV1 />,
  },
  {
    path: '/login-v2',
    title: 'Login V2',
    element: <LoginV2 />,
  },
  {
    path: '/login-v3',
    title: 'Login V3',
    element: <LoginV3 />,
  },
  {
    path: '*',
    element: <Navigate to={WILDCARD_ROUTES.PUBLIC} />,
    title: 'Rendering wildcard',
  },
];
