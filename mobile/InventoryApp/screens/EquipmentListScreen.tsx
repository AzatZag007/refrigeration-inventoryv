import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/apiConfig';
import { ExportService } from '../services/exportService';

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

export default function EquipmentListScreen() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, token } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // ✅ Правильные отступы для всех устройств
  const topInset = Platform.OS === 'ios' ? insets.top : (StatusBar.currentHeight ?? 0);
  const bottomInset = insets.bottom;

  const handleExportPDF = async () => {
    if (!equipment || equipment.length === 0) {
      Alert.alert('Ошибка', 'Нет данных для экспорта');
      return;
    }
    try {
      await ExportService.exportToPDF(equipment);
    } catch (error) {
      console.error('❌ Ошибка экспорта PDF:', error);
      Alert.alert('Ошибка', 'Не удалось экспортировать в PDF');
    }
  };

  const handleShareQR = async (item: Equipment) => {
    if (user?.role !== 'admin' && user?.role !== 'technician') {
      Alert.alert('Ошибка', 'У вас нет прав для этой операции');
      return;
    }
    try {
      await ExportService.generateQRForPrint(item);
    } catch (error) {
      console.error('❌ Ошибка генерации QR:', error);
      Alert.alert('Ошибка', 'Не удалось сгенерировать QR-код');
    }
  };

  const loadEquipment = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();

        const cleanedData: Equipment[] = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item?.id ?? 0,
          serial_number: item?.serial_number ?? '',
          model_name: item?.model_name ?? '',
          equipment_type: item?.equipment_type ?? '',
          manufacturer: item?.manufacturer ?? '',
          location: item?.location ?? '',
          qr_code_data: item?.qr_code_data ?? '',
          created_at: item?.created_at ?? new Date().toISOString(),
        }));

        setEquipment(cleanedData);
      } else {
        const errorText = await response.text();
        console.error('❌ Ошибка загрузки:', response.status, errorText);
        Alert.alert('Ошибка', `Не удалось загрузить оборудование (HTTP ${response.status})`);
      }
    } catch (error) {
      console.error('❌ Ошибка сети:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEquipment();
  };

  const handleEquipmentPress = (item: Equipment) => {
    navigation.navigate('EditEquipment', { equipment: item });
  };

  const handleDeleteEquipment = (item: Equipment) => {
    if (user?.role !== 'admin') {
      Alert.alert('Ошибка', 'Только администраторы могут удалять оборудование');
      return;
    }

    if (!token) {
      Alert.alert('Ошибка', 'Нет токена авторизации. Перелогиньтесь.');
      return;
    }

    Alert.alert(
      'Удаление оборудования',
      `Вы уверены, что хотите удалить "${item.model_name || 'оборудование'}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EQUIPMENT}/${item.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert('Успех', 'Оборудование удалено');
                loadEquipment();
              } else {
                const errorText = await response.text();
                console.error('❌ Ошибка удаления:', response.status, errorText);
                Alert.alert('Ошибка', `HTTP ${response.status}: ${errorText}`);
              }
            } catch (error) {
              console.error('❌ Сеть:', error);
              Alert.alert('Сеть', 'Не удалось удалить');
            }
          },
        },
      ]
    );
  };

  const handleEquipmentLongPress = (item: Equipment) => {
    if (user?.role === 'admin' || user?.role === 'technician') {
      const buttons: any[] = [
        { text: 'Печать QR-кода', onPress: () => handleShareQR(item) },
        {
          text: 'Редактировать',
          onPress: () => navigation.navigate('EditEquipment', { equipment: item }),
        },
      ];

      if (user?.role === 'admin') {
        buttons.push({
          text: 'Удалить',
          style: 'destructive',
          onPress: () => handleDeleteEquipment(item),
        });
      }

      buttons.push({ text: 'Отмена', style: 'cancel' });

      Alert.alert(
        'Действия с оборудованием',
        `Оборудование: ${item.model_name || 'Без названия'}`,
        buttons,
        {
          cancelable: true,
        }
      );
    } else {
      navigation.navigate('EditEquipment', { equipment: item });
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      (item.model_name || '').toLowerCase().includes(q) ||
      (item.equipment_type || '').toLowerCase().includes(q) ||
      (item.serial_number || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q) ||
      (item.manufacturer || '').toLowerCase().includes(q)
    );
  });

  const renderEquipmentItem = ({ item }: { item: Equipment }) => (
    <TouchableOpacity
      style={styles.equipmentItem}
      onPress={() => handleEquipmentPress(item)}
      onLongPress={() => handleEquipmentLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.equipmentHeader}>
        <Text style={styles.equipmentName} numberOfLines={2}>
          {item.model_name || 'Без названия'}
        </Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.equipment_type || 'Не указан'}</Text>
        </View>
      </View>

      <Text style={styles.equipmentManufacturer}>
        Производитель: {item.manufacturer || 'Не указан'}
      </Text>
      <Text style={styles.equipmentSerial}>Серийный: {item.serial_number || 'Не указан'}</Text>
      <Text style={styles.equipmentLocation}>📍 {item.location || 'Местоположение не указано'}</Text>

      <View style={styles.equipmentFooter}>
        <Text style={styles.equipmentId}>ID: {item.id}</Text>
        <Text style={styles.qrCode}>
          🔗 {item.qr_code_data ? 'QR сгенерирован' : 'QR не сгенерирован'}
        </Text>
      </View>

      {user?.role === 'admin' && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Админ</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: topInset }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка оборудования...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Поиск оборудования..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      <View style={styles.exportContainer}>
        <Text style={styles.exportTitle}>Экспорт данных</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
          <Text style={styles.exportButtonText}>📄 Экспорт в PDF</Text>
        </TouchableOpacity>
        <Text style={styles.exportHint}>
          Будет создан PDF отчет со всеми {equipment.length} единицами оборудования
        </Text>
      </View>

      <FlatList
        data={filteredEquipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: bottomInset + 100 } // Добавляем отступ снизу для Android
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Оборудование не найдено</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddEquipment')}
            >
              <Text style={styles.addButtonText}>Добавить первое оборудование</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
  },

  exportContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  exportButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exportHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  listContainer: {
    padding: 15,
  },

  equipmentItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  typeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },

  equipmentManufacturer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  equipmentSerial: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  equipmentLocation: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },

  equipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  equipmentId: {
    fontSize: 12,
    color: '#999',
  },
  qrCode: {
    fontSize: 12,
    color: '#999',
  },

  adminBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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

  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});EquipmentListScreen