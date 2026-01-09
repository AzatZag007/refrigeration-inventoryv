import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/apiConfig';

interface User {
  id: number;
  username: string;
  role: 'viewer' | 'technician' | 'admin';
  is_active: boolean;
}

const ROLES: Array<User['role']> = ['viewer', 'technician', 'admin'];

const UsersScreen = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<User['role']>('viewer');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, users]);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN_USERS}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const text = await response.text();
        Alert.alert('Ошибка', text || `HTTP ${response.status}`);
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить список');
    } finally {
      setLoading(false);
    }
  };

  const showRolePicker = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setRoleModalVisible(true);
  };

  const updateRole = async () => {
    if (!selectedUser || !token) return;
    try {
      await fetch(`${API_CONFIG.BASE_URL}/api/admin/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      await fetchUsers();
      Alert.alert('✅', `Роль изменена на "${selectedRole}"`);
      setRoleModalVisible(false);
    } catch {
      Alert.alert('❌', 'Ошибка обновления роли');
    }
  };

  const toggleActive = (userId: number, isActive: boolean) => {
    Alert.alert(
      isActive ? 'Деактивация' : 'Активация',
      `Пользователь будет ${isActive ? 'заблокирован' : 'разблокирован'}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: isActive ? 'Деактивировать' : 'Активировать',
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await fetch(`${API_CONFIG.BASE_URL}/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_active: !isActive }),
              });
              await fetchUsers();
              Alert.alert('✅', 'Статус изменён');
            } catch {
              Alert.alert('❌', 'Ошибка изменения');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) =>
    ({ viewer: '#34C759', technician: '#007AFF', admin: '#FF3B30' } as const)[
      role as 'viewer' | 'technician' | 'admin'
    ] || '#8E8E93';

  const getRoleIcon = (role: string) =>
    ({ admin: 'shield-sharp', technician: 'construct', viewer: 'eye' } as const)[
      role as 'viewer' | 'technician' | 'admin'
    ] || 'person';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={48} color="#007AFF" />
        </View>

        <View style={styles.info}>
          <Text style={styles.username}>{item.username}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
              <Ionicons name={getRoleIcon(item.role) as any} size={14} color="white" />
              <Text style={styles.roleText}>{item.role}</Text>
            </View>

            <Text style={[styles.status, item.is_active ? styles.active : styles.inactive]}>
              {item.is_active ? 'Активен' : 'Неактивен'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.btnRole]} onPress={() => showRolePicker(item)}>
          <Ionicons name="swap-horizontal" size={20} color="white" />
          <Text style={styles.btnText}>Роль</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, item.is_active ? styles.btnOff : styles.btnOn]}
          onPress={() => toggleActive(item.id, item.is_active)}
        >
          <Ionicons
            name={item.is_active ? 'toggle-sharp' : 'checkmark-circle'}
            size={20}
            color="white"
          />
          <Text style={styles.btnText}>{item.is_active ? 'Off' : 'On'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ✅ Заголовок по центру как на экране сканера */}
      <Text style={styles.title}>👥 Пользователи</Text>
      <Text style={styles.subtitle}>Всего: {filteredUsers.length}</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по имени..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchUsers}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Пользователи не найдены</Text>
          </View>
        }
      />

      <Modal visible={roleModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Смена роли для {selectedUser?.username}</Text>

            <Picker
              selectedValue={selectedRole}
              onValueChange={(value) => setSelectedRole(value as User['role'])}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {ROLES.map((role) => (
                <Picker.Item key={role} label={role.toUpperCase()} value={role} />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setRoleModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBtnConfirm} onPress={updateRole}>
                <Text style={[styles.modalBtnText, { color: 'white' }]}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },

  // ✅ как на "Сканирование QR-кода"
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 50,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: 'gray',
    paddingHorizontal: 16,
  },

  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 16 },
  avatar: { marginRight: 16 },
  info: { flex: 1, justifyContent: 'center' },
  username: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 4 },

  status: { fontSize: 14, fontWeight: '500' },
  active: { color: '#34C759' },
  inactive: { color: '#FF3B30' },

  actions: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  btnRole: { backgroundColor: '#5856D6' },
  btnOn: { backgroundColor: '#34C759' },
  btnOff: { backgroundColor: '#FF3B30' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 6 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 16, fontSize: 18, color: '#999', textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: { height: 200 },
  pickerItem: { height: 40 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
});

export default UsersScreen;
