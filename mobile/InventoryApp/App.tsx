import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import UsersScreen from './screens/UsersScreen';
import LoginScreen from './screens/LoginScreen';
import EquipmentListScreen from './screens/EquipmentListScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import AddEquipmentScreen from './screens/AddEquipmentScreen';
import EditEquipmentScreen from './screens/EditEquipmentScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const EquipmentIcon = () => <Text style={{ fontSize: 24 }}>📋</Text>;
const ScanIcon = () => <Text style={{ fontSize: 24 }}>📷</Text>;
const AddIcon = () => <Text style={{ fontSize: 24 }}>➕</Text>;
const UsersIcon = () => <Text style={{ fontSize: 24 }}>👥</Text>;
const ProfileIcon = () => <Text style={{ fontSize: 24 }}>👤</Text>;

function MainAppContent() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
  screenOptions={{
    tabBarStyle: {
      backgroundColor: '#f8f9fa',
      borderTopWidth: 1,
      borderTopColor: '#dee2e6',
      paddingBottom: Platform.OS === 'android' ? 35 : 25,
      height: Platform.OS === 'android' ? 95 : 85,
      paddingHorizontal: 8,
      position: 'absolute',
      bottom: 0,
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: '#6c757d',

    // ✅ делаем меньше + фиксируем высоту строки
    tabBarLabelStyle: {
      fontSize: Platform.OS === 'android' ? 9 : 10,
      lineHeight: Platform.OS === 'android' ? 10 : 12,
      fontWeight: '500',
      marginBottom: Platform.OS === 'android' ? 1 : 3,
    },

    // ✅ запрещаем “увеличение” текста из системных настроек
    tabBarAllowFontScaling: false,

    tabBarItemStyle: {
      paddingBottom: Platform.OS === 'android' ? 6 : 4,
      paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
      minHeight: Platform.OS === 'android' ? 48 : 52,
    },
    headerShown: false,
  }}
>
     <Tab.Screen
  name="Оборудование"
  component={EquipmentListScreen}
  options={{
    tabBarIcon: EquipmentIcon,
    tabBarLabel: ({ color }) => (
      <Text
        style={{ color, fontSize: 9, lineHeight: 10, textAlign: 'center' }}
        numberOfLines={2}
        allowFontScaling={false}
      >
        Оборудо{'\n'}вание
      </Text>
    ),
  }}
/>

      {(user?.role === 'admin' || user?.role === 'technician') && (
        <Tab.Screen
          name="Сканировать"
          component={QRScannerScreen}
          options={{ tabBarIcon: ScanIcon, tabBarLabel: 'Сканер' }}
        />
      )}

      {(user?.role === 'admin' || user?.role === 'technician') && (
        <Tab.Screen
          name="Добавить"
          component={AddEquipmentScreen}
          options={{ tabBarIcon: AddIcon, tabBarLabel: 'Добавить' }}
        />
      )}

    {user?.role === 'admin' && (
  <Tab.Screen
    name="Users"
    component={UsersScreen}
    options={{
      headerShown: false,
      tabBarLabel: ({ focused }) => (
        <Text style={{ fontSize: 10, color: focused ? '#007AFF' : 'gray' }}>
          Пользова{'\n'}тели
        </Text>
      ),
      tabBarIcon: ({ focused }) => <UsersIcon />,
    }}
  />
)}

      <Tab.Screen
        name="Профиль"
        component={ProfileScreen}
        options={{ tabBarIcon: ProfileIcon, tabBarLabel: 'Профиль' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="MainApp" component={MainAppContent} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}

      <Stack.Screen
        name="EditEquipment"
        component={EditEquipmentScreen}
        options={{
          headerShown: true,
          title: 'Редактирование',
          headerStyle: {
            backgroundColor: '#f8f9fa',
            height: Platform.OS === 'ios' ? 100 : 70,
          },
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        {/* ✅ Глобально задаём “обычный” status bar */}
        <StatusBar style="dark" translucent={false} />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
