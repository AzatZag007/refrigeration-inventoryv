export const API_CONFIG = {
  BASE_URL: 'https://refrigeration-inventoryv.onrender.com', // ✅ БЕЗ слеша
  ENDPOINTS: {
    EQUIPMENT: '/api/equipment',
    AUTH: '/api/auth',  
    ADMIN_USERS: '/api/admin/users',
  },
} as const;
