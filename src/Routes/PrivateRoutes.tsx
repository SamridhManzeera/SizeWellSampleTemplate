import { Navigate } from 'react-router-dom';
import {
  ROUTES_CONFIG,
  WILDCARD_ROUTES,
  PROJECT_TYPE,
  ProjectType,
} from '../Shared/Constants';
import BookingSchedule from '../Views/BookingSchedule';
import ScheduleConfig from '../Views/ScheduleConfig/ScheduleConfig';
import Requests from '../Views/Requests/Requests';
import RequestForm from '../Views/Requests/RequestForm';
import SLTRequests from '../Views/SLT/SLTRequests';
import SLTRequestView from '../Views/SLT/SLTRequestView';
import LiveTracking from '../Views/LiveTracking/LiveTracking';
import Profile from '../Views/Profile/Profile';
import Notifications from '../Views/Notifications/Notifications';
import UserManagement from '../Views/UserManagement/UserManagement';
import Dashboard from '../Views/Dashboard';
import SpaceFormListing, {
  SpaceRequestFormLayout,
  SpaceGeneralForm,
  SpaceModulePage,
  SpaceWorkforceForm,
  SpaceViewFormLayout,
  SpaceViewFormGeneral,
  SpaceViewModulePage,
  SpaceViewWorkforceForm,
} from '../Views/IAM/SpaceRequestForm';
import LoginV1 from '../Views/Login/LoginV1';
import LoginV2 from '../Views/Login/LoginV2';
import LoginV3 from '../Views/Login/LoginV3';
import LoginV4 from '../Views/Login/LoginV4';
import LoginV5 from '../Views/Login/LoginV5';
import LoginV6 from '../Views/Login/LoginV6';
import { CustomRouter } from './RootRoutes';

export const SLOT_ALLOCATION_ROUTES: Array<CustomRouter> = [
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
  {
    path: ROUTES_CONFIG.SLT_REQUESTS.path,
    element: <SLTRequests />,
    title: ROUTES_CONFIG.SLT_REQUESTS.title,
  },
  {
    path: ROUTES_CONFIG.SLT_REQUESTS_VIEW.path,
    element: <SLTRequestView />,
    title: ROUTES_CONFIG.SLT_REQUESTS_VIEW.title,
  },
  {
    path: ROUTES_CONFIG.LIVE_TRACKING.path,
    element: <LiveTracking />,
    title: ROUTES_CONFIG.LIVE_TRACKING.title,
  },
  {
    path: ROUTES_CONFIG.ADMIN_PROFILE.path,
    element: <Profile />,
    title: ROUTES_CONFIG.ADMIN_PROFILE.title,
  },
  {
    path: ROUTES_CONFIG.CONTRACTOR_PROFILE.path,
    element: <Profile />,
    title: ROUTES_CONFIG.CONTRACTOR_PROFILE.title,
  },
  {
    path: ROUTES_CONFIG.ADMIN_NOTIFICATIONS.path,
    element: <Notifications />,
    title: ROUTES_CONFIG.ADMIN_NOTIFICATIONS.title,
  },
  {
    path: ROUTES_CONFIG.CONTRACTOR_NOTIFICATIONS.path,
    element: <Notifications />,
    title: ROUTES_CONFIG.CONTRACTOR_NOTIFICATIONS.title,
  },
  {
    path: ROUTES_CONFIG.ADMIN_USER_MANAGEMENT.path,
    element: <UserManagement />,
    title: ROUTES_CONFIG.ADMIN_USER_MANAGEMENT.title,
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
    path: ROUTES_CONFIG.ABOUT.path,
    element: '<ABOUT />',
    title: ROUTES_CONFIG.ABOUT.title,
  },
  {
    path: '/wishlist',
    element: 'Your wishlist here',
    title: 'Dashboard',
  },
  {
    path: ROUTES_CONFIG.LOGIN_MOCKUP_V1.path,
    element: <LoginV1 />,
    title: ROUTES_CONFIG.LOGIN_MOCKUP_V1.title,
  },
  {
    path: ROUTES_CONFIG.LOGIN_MOCKUP_V2.path,
    element: <LoginV2 />,
    title: ROUTES_CONFIG.LOGIN_MOCKUP_V2.title,
  },
  {
    path: ROUTES_CONFIG.LOGIN_MOCKUP_V3.path,
    element: <LoginV3 />,
    title: ROUTES_CONFIG.LOGIN_MOCKUP_V3.title,
  },
  {
    path: ROUTES_CONFIG.LOGIN_MOCKUP_V4.path,
    element: <LoginV4 />,
    title: ROUTES_CONFIG.LOGIN_MOCKUP_V4.title,
  },
  {
    path: ROUTES_CONFIG.LOGIN_MOCKUP_V5.path,
    element: <LoginV5 />,
    title: ROUTES_CONFIG.LOGIN_MOCKUP_V5.title,
  },
  {
    path: ROUTES_CONFIG.LOGIN_MOCKUP_V6.path,
    element: <LoginV6 />,
    title: ROUTES_CONFIG.LOGIN_MOCKUP_V6.title,
  },
  {
    path: '*',
    element: <Navigate to={WILDCARD_ROUTES.PRIVATE} />,
    title: 'Rendering wildcard',
  },
];

const SPACE_REQUESTS_NEW_CHILDREN: Array<CustomRouter> = [
  {
    index: true,
    element: <Navigate to="general" replace />,
    title: ROUTES_CONFIG.SPACE_REQUESTS_NEW.title,
  },
  {
    path: 'general',
    element: <SpaceGeneralForm />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_NEW.title} · General`,
  },
  {
    path: 'work-area',
    element: <SpaceModulePage moduleKey="workArea" label="Work Area" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_NEW.title} · Work Area`,
  },
  {
    path: 'it',
    element: <SpaceModulePage moduleKey="it" label="IT" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_NEW.title} · IT`,
  },
  {
    path: 'water',
    element: <SpaceModulePage moduleKey="water" label="Water" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_NEW.title} · Water`,
  },
  {
    path: 'welfare',
    element: <SpaceModulePage moduleKey="welfare" label="Welfare" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_NEW.title} · Welfare`,
  },
  {
    path: 'power',
    element: <SpaceModulePage moduleKey="power" label="Power" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_NEW.title} · Power`,
  },
  {
    path: 'workforce',
    element: <SpaceWorkforceForm />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_NEW.title} · Workforce`,
  },
];

const SPACE_REQUESTS_VIEW_CHILDREN: Array<CustomRouter> = [
  {
    index: true,
    element: <Navigate to="general" replace />,
    title: ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title,
  },
  {
    path: 'general',
    element: <SpaceViewFormGeneral />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title} · General`,
  },
  {
    path: 'work-area',
    element: <SpaceViewModulePage moduleKey="workArea" label="Work Area" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title} · Work Area`,
  },
  {
    path: 'it',
    element: <SpaceViewModulePage moduleKey="it" label="IT" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title} · IT`,
  },
  {
    path: 'water',
    element: <SpaceViewModulePage moduleKey="water" label="Water" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title} · Water`,
  },
  {
    path: 'welfare',
    element: <SpaceViewModulePage moduleKey="welfare" label="Welfare" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title} · Welfare`,
  },
  {
    path: 'power',
    element: <SpaceViewModulePage moduleKey="power" label="Power" />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title} · Power`,
  },
  {
    path: 'workforce',
    element: <SpaceViewWorkforceForm />,
    title: `${ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title} · Workforce`,
  },
];

export const IAM_ROUTES: Array<CustomRouter> = [
  {
    path: ROUTES_CONFIG.DASHBOARD.path,
    element: <Dashboard />,
    title: ROUTES_CONFIG.DASHBOARD.title,
  },
  {
    path: ROUTES_CONFIG.SPACE_REQUESTS.path,
    element: <SpaceFormListing />,
    title: ROUTES_CONFIG.SPACE_REQUESTS.title,
  },
  {
    path: ROUTES_CONFIG.SPACE_REQUESTS_NEW.path,
    element: <SpaceRequestFormLayout />,
    title: ROUTES_CONFIG.SPACE_REQUESTS_NEW.title,
    children: SPACE_REQUESTS_NEW_CHILDREN,
  },
  {
    path: ROUTES_CONFIG.SPACE_REQUESTS_VIEW.path,
    element: <SpaceViewFormLayout />,
    title: ROUTES_CONFIG.SPACE_REQUESTS_VIEW.title,
    children: SPACE_REQUESTS_VIEW_CHILDREN,
  },
  {
    path: '*',
    element: <Navigate to={ROUTES_CONFIG.DASHBOARD.path} />,
    title: 'Rendering wildcard',
  },
];

export const getPrivateRoutes = (
  projecttype?: ProjectType | null
): Array<CustomRouter> => {
  switch (projecttype) {
    case PROJECT_TYPE.IAM:
      return IAM_ROUTES;
    case PROJECT_TYPE.SLOT_ALLOCATION:
    default:
      return SLOT_ALLOCATION_ROUTES;
  }
};
