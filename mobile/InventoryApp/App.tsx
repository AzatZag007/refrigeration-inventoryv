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

function MainTabs() {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Equipment"
        component={EquipmentListScreen}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 10, color: focused ? '#007AFF' : 'gray' }}>
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
            headerShown: false,
            tabBarLabel: ({ focused }) => (
              <Text style={{ fontSize: 10, color: focused ? '#007AFF' : 'gray' }}>
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
            headerShown: false,
            tabBarLabel: ({ focused }) => (
              <Text style={{ fontSize: 10, color: focused ? '#007AFF' : 'gray' }}>
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
            headerShown: false,
            tabBarLabel: ({ focused }) => (
              <Text style={{ fontSize: 10, color: focused ? '#007AFF' : 'gray' }}>
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
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 10, color: focused ? '#007AFF' : 'gray' }}>
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="EditEquipment" 
        component={EditEquipmentScreen}
        options={{ headerShown: true, title: 'Редактировать' }}
      />
      <Stack.Screen 
        name="AddEquipment" 
        component={AddEquipmentScreen}
        options={{ headerShown: true, title: 'Добавить оборудование' }}
      />
    </Stack.Navigator>
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
