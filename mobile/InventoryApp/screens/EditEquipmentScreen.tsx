import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/apiConfig';  // ✅ ИЗМЕНЕНО: API_CONFIG!

interface Equipment {
  id: number;
  serial_number: string;
  model_name: string;
  equipment_type: string;
  manufacturer: string;
  location: string;
  qr_code_data: string;
  created_at: string;
}

export default function EditEquipmentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, token } = useAuth(); // 🔥 ВАЖНО: получаем и user и token
  
  const { equipment: initialEquipment } = route.params as { equipment: Equipment };
  
  const [equipment, setEquipment] = useState<Equipment>(initialEquipment);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔥 Функция загрузки актуальных данных с сервера ✅ API_CONFIG!
  const loadEquipmentData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Загрузка данных оборудования ID:', equipment.id);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/equipment/${equipment.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // 🔥 ДОБАВЛЯЕМ ТОКЕН
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Данные оборудования загружены:', data);
        
        setEquipment({
          id: data.id || 0,
          serial_number: data.serial_number || '',
          model_name: data.model_name || '',
          equipment_type: data.equipment_type || '',
          manufacturer: data.manufacturer || '',
          location: data.location || '',
          qr_code_data: data.qr_code_data || '',
          created_at: data.created_at || ''
        });
      } else {
        console.error('❌ Ошибка загрузки:', response.status);
        Alert.alert('Ошибка', 'Не удалось загрузить данные оборудования');
      }
    } catch (error) {
      console.error('❌ Ошибка сети:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Функция сохранения изменений ✅ API_CONFIG!
  const handleSave = async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'technician')) {
      Alert.alert('Ошибка', 'У вас нет прав для редактирования оборудования');
      return;
    }

    if (!token) {
      Alert.alert('Ошибка авторизации', 'Токен доступа отсутствует. Пожалуйста, войдите снова.');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Сохранение оборудования ID:', equipment.id);
      console.log('🔑 Используемый токен:', token ? 'присутствует' : 'отсутствует');

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/equipment/${equipment.id}`, {  // ✅ API_CONFIG!
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 🔥 ТОКЕН!
        },
        body: JSON.stringify({
          serial_number: equipment.serial_number,
          model_name: equipment.model_name,
          equipment_type: equipment.equipment_type,
          manufacturer: equipment.manufacturer,
          location: equipment.location
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Оборудование обновлено:', result);
        Alert.alert('Успех', 'Оборудование успешно обновлено');
        navigation.goBack();
      } else {
        const errorData = await response.text();  // text() вместо json() для безопасности
        console.error('❌ Ошибка сохранения:', response.status, errorData);
        
        if (response.status === 401) {
          Alert.alert('Ошибка авторизации', 'Недействительный токен. Пожалуйста, войдите снова.');
        } else if (response.status === 403) {
          Alert.alert('Ошибка прав доступа', 'У вас недостаточно прав для этого действия');
        } else {
          Alert.alert('Ошибка', errorData || 'Не удалось обновить оборудование');
        }
      }
    } catch (error) {
      console.error('❌ Ошибка сети при сохранении:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadEquipmentData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Серийный номер *</Text>
          <TextInput
            style={styles.input}
            value={equipment.serial_number}
            onChangeText={(text) => setEquipment({...equipment, serial_number: text})}
            placeholder="Введите серийный номер"
            editable={user?.role === 'admin' || user?.role === 'technician'}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Модель *</Text>
          <TextInput
            style={styles.input}
            value={equipment.model_name}
            onChangeText={(text) => setEquipment({...equipment, model_name: text})}
            placeholder="Введите модель оборудования"
            editable={user?.role === 'admin' || user?.role === 'technician'}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Тип оборудования *</Text>
          <TextInput
            style={styles.input}
            value={equipment.equipment_type}
            onChangeText={(text) => setEquipment({...equipment, equipment_type: text})}
            placeholder="Введите тип оборудования"
            editable={user?.role === 'admin' || user?.role === 'technician'}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Производитель *</Text>
          <TextInput
            style={styles.input}
            value={equipment.manufacturer}
            onChangeText={(text) => setEquipment({...equipment, manufacturer: text})}
            placeholder="Введите производителя"
            editable={user?.role === 'admin' || user?.role === 'technician'}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Местоположение *</Text>
          <TextInput
            style={styles.input}
            value={equipment.location}
            onChangeText={(text) => setEquipment({...equipment, location: text})}
            placeholder="Введите местоположение"
            editable={user?.role === 'admin' || user?.role === 'technician'}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>ID оборудования:</Text>
          <Text style={styles.infoValue}>{equipment.id}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>QR-код:</Text>
          <Text style={styles.infoValue}>
            {equipment.qr_code_data ? 'Сгенерирован' : 'Не сгенерирован'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Дата добавления:</Text>
          <Text style={styles.infoValue}>
            {new Date(equipment.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </View>

        {(user?.role === 'admin' || user?.role === 'technician') && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Сохранить изменения</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});