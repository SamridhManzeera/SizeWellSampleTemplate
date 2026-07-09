const STRING: string = 'Test';
export { STRING };

const ROUTES = {
  HOMEPAGE: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ABOUT: '/about-us',
  BOOKING_SCHEDULE: '/booking-schedule',
  SCHEDULE_CONFIG: '/schedule-config',
  REQUESTS: '/requests',
  REQUESTS_APPLY: '/requests/apply',
  REQUESTS_VIEW: '/requests/:id',
  LIVE_TRACKING: '/live-tracking',
  ADMIN_PROFILE: '/admin/profile',
  CONTRACTOR_PROFILE: '/contractor/profile',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  CONTRACTOR_NOTIFICATIONS: '/contractor/notifications',
};

const WILDCARD_ROUTES = {
  PUBLIC: ROUTES.HOMEPAGE,
  PRIVATE: ROUTES.LOGIN,
};

const ROUTES_CONFIG = {
  HOMEPAGE: {
    path: ROUTES.HOMEPAGE,
    title: 'Master Plan',
  },
  LOGIN: {
    path: ROUTES.LOGIN,
    title: 'Login',
  },
  REGISTER: {
    path: ROUTES.REGISTER,
    title: 'Register',
  },
  ABOUT: {
    path: ROUTES.ABOUT,
    title: 'About us',
  },
  BOOKING_SCHEDULE: {
    path: ROUTES.BOOKING_SCHEDULE,
    title: 'Booking Schedule',
  },
  SCHEDULE_CONFIG: {
    path: ROUTES.SCHEDULE_CONFIG,
    title: 'Schedule Config',
  },
  REQUESTS: {
    path: ROUTES.REQUESTS,
    title: 'Requests',
  },
  REQUESTS_APPLY: {
    path: ROUTES.REQUESTS_APPLY,
    title: 'Apply Request',
  },
  REQUESTS_VIEW: {
    path: ROUTES.REQUESTS_VIEW,
    title: 'View Request',
  },
  LIVE_TRACKING: {
    path: ROUTES.LIVE_TRACKING,
    title: 'Live Tracking',
  },
  ADMIN_PROFILE: {
    path: ROUTES.ADMIN_PROFILE,
    title: 'Profile',
  },
  CONTRACTOR_PROFILE: {
    path: ROUTES.CONTRACTOR_PROFILE,
    title: 'Profile',
  },
  ADMIN_NOTIFICATIONS: {
    path: ROUTES.ADMIN_NOTIFICATIONS,
    title: 'Notifications',
  },
  CONTRACTOR_NOTIFICATIONS: {
    path: ROUTES.CONTRACTOR_NOTIFICATIONS,
    title: 'Notifications',
  },
};

export { ROUTES, WILDCARD_ROUTES, ROUTES_CONFIG };
