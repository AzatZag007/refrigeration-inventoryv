import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Импорты экранов
import LoginScreen from './screens/LoginScreen';
import EquipmentListScreen from './screens/EquipmentListScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import AddEquipmentScreen from './screens/AddEquipmentScreen';
import EditEquipmentScreen from './screens/EditEquipmentScreen';
import ProfileScreen from './screens/ProfileScreen'; // Добавьте этот импорт

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Компоненты для иконок табов
const EquipmentIcon = () => <Text>📋</Text>;
const ScanIcon = () => <Text>📷</Text>;
const AddIcon = () => <Text>➕</Text>;
const ProfileIcon = () => <Text>👤</Text>; // Добавьте иконку профиля

// Главное приложение с табами (после авторизации)
function MainApp() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#f8f9fa',
          borderTopWidth: 1,
          borderTopColor: '#dee2e6',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#6c757d',
      }}
    >
      <Tab.Screen 
        name="Оборудование" 
        component={EquipmentListScreen}
        options={{
          tabBarIcon: EquipmentIcon,
          headerShown: false,
        }}
      />
      
      {/* Сканирование доступно техникам и админам */}
      {(user?.role === 'admin' || user?.role === 'technician') && (
        <Tab.Screen 
          name="Сканировать" 
          component={QRScannerScreen}
          options={{
            tabBarIcon: ScanIcon,
            headerShown: false,
          }}
        />
      )}
      
      {/* Добавление доступно только админам и техникам */}
      {(user?.role === 'admin' || user?.role === 'technician') && (
        <Tab.Screen 
          name="Добавить" 
          component={AddEquipmentScreen}
          options={{
            tabBarIcon: AddIcon,
            headerShown: false,
          }}
        />
      )}
      
      {/* Экран профиля с выходом - доступен всем */}
      <Tab.Screen 
        name="Профиль" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ProfileIcon,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Остальной код без изменений...
function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen 
          name="MainApp" 
          component={MainApp}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
      
      <Stack.Screen 
        name="EditEquipment" 
        component={EditEquipmentScreen}
        options={{
          headerShown: true,
          title: 'Редактирование оборудования'
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}