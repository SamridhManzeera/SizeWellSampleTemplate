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
  REQUESTS_EMERGENCY_APPLY: '/requests/emergency',
  REQUESTS_VIEW: '/requests/:id',
  SLT_REQUESTS: '/slt/requests',
  SLT_REQUESTS_VIEW: '/slt/requests/:id',
  SLT_DELIVERY_SLOTS: '/slt/delivery-slots',
  LIVE_TRACKING: '/live-tracking',
  ADMIN_PROFILE: '/admin/profile',
  CONTRACTOR_PROFILE: '/contractor/profile',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  CONTRACTOR_NOTIFICATIONS: '/contractor/notifications',
  ADMIN_USER_MANAGEMENT: '/admin/user-management',
  DASHBOARD: '/dashboard',
  SPACE_REQUESTS: '/space-requests',
  SPACE_REQUESTS_NEW: '/space-requests/new',
  SPACE_REQUESTS_VIEW: '/space-requests/:id',
  REVIEWER_REQUESTS: '/reviewer/requests',
  REVIEWER_REQUESTS_VIEW: '/reviewer/requests/:id',
  REVIEWER_WORK_AREA: '/reviewer/work-area',
  REVIEWER_IT: '/reviewer/it',
  REVIEWER_WATER: '/reviewer/water',
  REVIEWER_WELFARE: '/reviewer/welfare',
  REVIEWER_POWER: '/reviewer/power',
  REVIEWER_WORKFORCE: '/reviewer/workforce',
  LOGIN_MOCKUP_V1: '/mockups/login-v1',
  LOGIN_MOCKUP_V2: '/mockups/login-v2',
  LOGIN_MOCKUP_V3: '/mockups/login-v3',
  LOGIN_MOCKUP_V4: '/mockups/login-v4',
  LOGIN_MOCKUP_V5: '/mockups/login-v5',
  LOGIN_MOCKUP_V6: '/mockups/login-v6',
  FMT_DASHBOARD: '/fmt/dashboard',
  FMT_ALLOCATION_TABLE: '/fmt/allocation-table',
  FMT_EMERGENCY_REQUESTS: '/fmt/emergency-requests',
  FMT_EMERGENCY_REQUESTS_VIEW: '/fmt/emergency-requests/:id',
};

// projecttype returned by the login API; drives which private routes/layout are shown
const PROJECT_TYPE = {
  SLOT_ALLOCATION: 1,
  IAM: 2,
} as const;

export type ProjectType = (typeof PROJECT_TYPE)[keyof typeof PROJECT_TYPE];

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
  REQUESTS_EMERGENCY_APPLY: {
    path: ROUTES.REQUESTS_EMERGENCY_APPLY,
    title: 'Emergency Request',
  },
  REQUESTS_VIEW: {
    path: ROUTES.REQUESTS_VIEW,
    title: 'View Request',
  },
  SLT_REQUESTS: {
    path: ROUTES.SLT_REQUESTS,
    title: 'SLT Requests',
  },
  SLT_REQUESTS_VIEW: {
    path: ROUTES.SLT_REQUESTS_VIEW,
    title: 'Delivery Request Allocation',
  },
  SLT_DELIVERY_SLOTS: {
    path: ROUTES.SLT_DELIVERY_SLOTS,
    title: 'Company Delivery Slots',
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
  DASHBOARD: {
    path: ROUTES.DASHBOARD,
    title: 'Dashboard',
  },
  SPACE_REQUESTS: {
    path: ROUTES.SPACE_REQUESTS,
    title: 'Space Requests',
  },
  SPACE_REQUESTS_NEW: {
    path: ROUTES.SPACE_REQUESTS_NEW,
    title: 'Space Request Form',
  },
  SPACE_REQUESTS_VIEW: {
    path: ROUTES.SPACE_REQUESTS_VIEW,
    title: 'View Space Request',
  },
  REVIEWER_REQUESTS_VIEW: {
    path: ROUTES.REVIEWER_REQUESTS_VIEW,
    title: 'Review Request',
  },
  REVIEWER_WORK_AREA: {
    path: ROUTES.REVIEWER_WORK_AREA,
    title: 'Work Area Requests',
  },
  REVIEWER_IT: {
    path: ROUTES.REVIEWER_IT,
    title: 'IT Requests',
  },
  REVIEWER_WATER: {
    path: ROUTES.REVIEWER_WATER,
    title: 'Water Requests',
  },
  REVIEWER_WELFARE: {
    path: ROUTES.REVIEWER_WELFARE,
    title: 'Welfare Requests',
  },
  REVIEWER_POWER: {
    path: ROUTES.REVIEWER_POWER,
    title: 'Power Requests',
  },
  REVIEWER_WORKFORCE: {
    path: ROUTES.REVIEWER_WORKFORCE,
    title: 'Workforce Requests',
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
  FMT_DASHBOARD: {
    path: ROUTES.FMT_DASHBOARD,
    title: 'FMT Dashboard',
  },
  FMT_ALLOCATION_TABLE: {
    path: ROUTES.FMT_ALLOCATION_TABLE,
    title: 'Allocation Table',
  },
  FMT_EMERGENCY_REQUESTS: {
    path: ROUTES.FMT_EMERGENCY_REQUESTS,
    title: 'Emergency Requests',
  },
  FMT_EMERGENCY_REQUESTS_VIEW: {
    path: ROUTES.FMT_EMERGENCY_REQUESTS_VIEW,
    title: 'Emergency Request',
  },
};

export { ROUTES, WILDCARD_ROUTES, ROUTES_CONFIG, PROJECT_TYPE };
