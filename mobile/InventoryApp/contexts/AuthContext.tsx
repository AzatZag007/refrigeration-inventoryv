import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (requiredRole: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Загрузка сохраненных данных при запуске
  useEffect(() => {
    // В реальном приложении загружайте из SecureStore
    const savedToken = null; // await SecureStore.getItemAsync('token');
    const savedUser = null; // await SecureStore.getItemAsync('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    // Сохраняем в SecureStore
    // await SecureStore.setItemAsync('token', authToken);
    // await SecureStore.setItemAsync('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Удаляем из SecureStore
    // await SecureStore.deleteItemAsync('token');
    // await SecureStore.deleteItemAsync('user');
  };

  const hasPermission = (requiredRole: string) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'viewer': 1,
      'technician': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};