import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // ✅ Загрузка из AsyncStorage при запуске
  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Load auth error:', error);
    }
  };

  const login = async (userData: User, authToken: string) => {
    try {
      await AsyncStorage.setItem('token', authToken); // ✅ Сохраняем!
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error('Save auth error:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
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
};;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};