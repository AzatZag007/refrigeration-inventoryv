import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import UsersScreen from './screens/UsersScreen';
import LoginScreen from './screens/LoginScreen';
import EquipmentListScreen from './screens/EquipmentListScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import AddEquipmentScreen from './screens/AddEquipmentScreen';
import EditEquipmentScreen from './screens/EditEquipmentScreen';
import ProfileScreen from './screens/ProfileScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Определяем типы для навигации
export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
  MainTabs: undefined;
  EditEquipment: { equipmentId?: string; equipment?: any; scanData?: string };
  AddEquipment: undefined;
};

export type TabParamList = {
  Equipment: undefined;
  Scanner: undefined;
  Add: undefined;
  Users: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Компоненты иконок
const EquipmentIcon = () => <Text style={{ fontSize: 24 }}>📋</Text>;
const ScanIcon = () => <Text style={{ fontSize: 24 }}>📷</Text>;
const AddIcon = () => <Text style={{ fontSize: 24 }}>➕</Text>;
const UsersIcon = () => <Text style={{ fontSize: 24 }}>👥</Text>;
const ProfileIcon = () => <Text style={{ fontSize: 24 }}>👤</Text>;

function MainTabs() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets(); // ✅ ДОБАВИЛИ

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',

          // ❗ ВОТ ЭТО ГЛАВНЫЙ ФИКС
          height: Platform.OS === 'ios' ? 85 : 60 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 25 : insets.bottom || 12,
          paddingTop: Platform.OS === 'ios' ? 5 : 0,
        },
      }}
    >
      <Tab.Screen
        name="Equipment"
        component={EquipmentListScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{ 
              fontSize: 10, 
              color: focused ? '#007AFF' : 'gray',
              fontWeight: focused ? '600' : '400',
            }}>
              Оборудо{'\n'}вание
            </Text>
          ),
          tabBarIcon: EquipmentIcon,
        }}
      />
      
      {(user?.role === 'admin' || user?.role === 'technician') && (
        <Tab.Screen
          name="Scanner"
          component={QRScannerScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text style={{ 
                fontSize: 10, 
                color: focused ? '#007AFF' : 'gray',
                fontWeight: focused ? '600' : '400',
              }}>
                Сканиро{'\n'}вание
              </Text>
            ),
            tabBarIcon: ScanIcon,
          }}
        />
      )}

      {(user?.role === 'admin' || user?.role === 'technician') && (
        <Tab.Screen
          name="Add"
          component={AddEquipmentScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text style={{ 
                fontSize: 10, 
                color: focused ? '#007AFF' : 'gray',
                fontWeight: focused ? '600' : '400',
              }}>
                Добавить
              </Text>
            ),
            tabBarIcon: AddIcon,
          }}
        />
      )}

      {user?.role === 'admin' && (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text style={{ 
                fontSize: 10, 
                color: focused ? '#007AFF' : 'gray',
                fontWeight: focused ? '600' : '400',
              }}>
                Пользова{'\n'}тели
              </Text>
            ),
            tabBarIcon: UsersIcon,
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{ 
              fontSize: 10, 
              color: focused ? '#007AFF' : 'gray',
              fontWeight: focused ? '600' : '400',
            }}>
              Профиль
            </Text>
          ),
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}

function MainAppContent() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="EditEquipment" 
        component={EditEquipmentScreen}
        options={{ 
          headerShown: true, 
          title: 'Редактировать оборудование',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitle: 'Назад',
        }}
      />
      <Stack.Screen 
        name="AddEquipment" 
        component={AddEquipmentScreen}
        options={{ 
          headerShown: true, 
          title: 'Добавить оборудование',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitle: 'Назад',
        }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      {user ? (
        <Stack.Screen name="MainApp" component={MainAppContent} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar 
            style="dark" 
            backgroundColor="#ffffff" 
          />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}