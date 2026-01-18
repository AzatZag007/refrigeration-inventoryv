import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/apiConfig';

interface LoginResponse {
  error?: string;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    full_name: string | null;
  };
  token?: string;
}

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const { login } = useAuth();

const handleAuth = async () => {
  if (!username || !password) {
    Alert.alert('Ошибка', 'Заполните все поля');
    return;
  }

  setLoading(true);
  try {
    const endpoint = isLogin ? '/login' : '/register';
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        password,
        ...(isLogin ? {} : { email: `${username.trim()}@inventory.com` }),
      }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      Alert.alert(
        'Ошибка сервера',
        `Сервер вернул HTML вместо JSON (статус ${response.status})`
      );
      return;
    }

    const result: LoginResponse = await response.json();

    if (response.ok && result.user && result.token) {
      login(result.user, result.token);
      Alert.alert('Успех', `Добро пожаловать, ${result.user.username}!`);
    } else {
      Alert.alert('Ошибка', result.error || result.message || 'Ошибка авторизации');
    }
  } catch (error: any) {
    console.error('❌ Ошибка авторизации:', error);
    Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>❄️ Инвентаризация</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Вход в систему' : 'Регистрация'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имя пользователя</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Введите имя пользователя"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Введите пароль"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.authButton}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.authButtonText}>
                {isLogin ? '🔑 Войти' : '📝 Зарегистрироваться'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            <Text style={styles.switchButtonText}>
              {isLogin
                ? 'Нет аккаунта? Зарегистрироваться'
                : 'Уже есть аккаунт? Войти'}
            </Text>
          </TouchableOpacity>

          <View style={styles.demoAccounts}>
            <Text style={styles.demoTitle}>Демо-аккаунты:</Text>
            <Text style={styles.demoAccount}>👑 Админ: admin / admin123</Text>
            <Text style={styles.demoAccount}>🔧 Техник: tech / tech123</Text>
            <Text style={styles.demoAccount}>👀 Просмотр: viewer / viewer123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  subtitle: { fontSize: 18, color: 'gray', textAlign: 'center' },

  form: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 16,
  },

  authButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  authButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  switchButton: { padding: 10, alignItems: 'center' },
  switchButtonText: { color: '#007AFF', fontSize: 14 },

  demoAccounts: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
  demoAccount: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 5,
    textAlign: 'center',
  },
});