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
  ADMIN_USER_MANAGEMENT: '/admin/user-management',
  LOGIN_MOCKUP_V1: '/mockups/login-v1',
  LOGIN_MOCKUP_V2: '/mockups/login-v2',
  LOGIN_MOCKUP_V3: '/mockups/login-v3',
  LOGIN_MOCKUP_V4: '/mockups/login-v4',
  LOGIN_MOCKUP_V5: '/mockups/login-v5',
  LOGIN_MOCKUP_V6: '/mockups/login-v6',
};

const WILDCARD_ROUTES = {
  PUBLIC: ROUTES.LOGIN,
  PRIVATE: ROUTES.HOMEPAGE,
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
  ADMIN_USER_MANAGEMENT: {
    path: ROUTES.ADMIN_USER_MANAGEMENT,
    title: 'User & Role Management',
  },
  LOGIN_MOCKUP_V1: {
    path: ROUTES.LOGIN_MOCKUP_V1,
    title: 'Login V1',
  },
  LOGIN_MOCKUP_V2: {
    path: ROUTES.LOGIN_MOCKUP_V2,
    title: 'Login V2',
  },
  LOGIN_MOCKUP_V3: {
    path: ROUTES.LOGIN_MOCKUP_V3,
    title: 'Login V3',
  },
  LOGIN_MOCKUP_V4: {
    path: ROUTES.LOGIN_MOCKUP_V4,
    title: 'Login V4',
  },
  LOGIN_MOCKUP_V5: {
    path: ROUTES.LOGIN_MOCKUP_V5,
    title: 'Login V5',
  },
  LOGIN_MOCKUP_V6: {
    path: ROUTES.LOGIN_MOCKUP_V6,
    title: 'Login V6',
  },
};

export { ROUTES, WILDCARD_ROUTES, ROUTES_CONFIG };
