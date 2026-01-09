import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function NavigationHandler() {
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Навигация произойдет автоматически благодаря структуре AppNavigator
      console.log('✅ Пользователь авторизован, навигация обновлена');
    } else {
      console.log('🚪 Пользователь не авторизован');
    }
  }, [user, navigation]);

  return null; // Этот компонент не рендерит ничего
}