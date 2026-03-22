export const API_CONFIG = {
  BASE_URL: 'http://172.20.10.3:5000', // БЕЗ слеша!
  ENDPOINTS: {
    EQUIPMENT: '/api/equipment',
    AUTH: '/api/auth',  
    ADMIN_USERS: '/api/admin/users',
  },
} as const;
