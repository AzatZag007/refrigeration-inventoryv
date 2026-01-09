import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Button, 
  Alert, 
  ScrollView,
  TouchableOpacity 
} from 'react-native';

interface Equipment {
  id: number;
  serial_number: string;
  model_name: string;
  equipment_type: string;
  manufacturer: string;
  location: string;
  status: string;
}

export default function AddEquipmentScreen({ navigation }: any) {
  const [serialNumber, setSerialNumber] = useState('');
  const [modelName, setModelName] = useState('');
  const [equipmentType, setEquipmentType] = useState('Холодильник');
  const [manufacturer, setManufacturer] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const addEquipment = async () => {
    if (!serialNumber || !modelName || !manufacturer || !location) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.186:5000/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serial_number: serialNumber,
          model_name: modelName,
          equipment_type: equipmentType,
          manufacturer: manufacturer,
          location: location
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Успех', 'Оборудование добавлено!');
        // Очищаем форму
        setSerialNumber('');
        setModelName('');
        setEquipmentType('Холодильник');
        setManufacturer('');
        setLocation('');
      } else {
        Alert.alert('Ошибка', result.error || 'Не удалось добавить оборудование');
      }
    } catch (error) {
      console.error('Ошибка добавления:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>➕ Добавить оборудование</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Серийный номер *</Text>
        <TextInput
          style={styles.input}
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder="Например: FRIDGE-003"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Модель *</Text>
        <TextInput
          style={styles.input}
          value={modelName}
          onChangeText={setModelName}
          placeholder="Например: Холодильник промышленный X200"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Тип оборудования</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[
              styles.radioButton, 
              equipmentType === 'Холодильник' && styles.radioButtonSelected
            ]}
            onPress={() => setEquipmentType('Холодильник')}
          >
            <Text style={equipmentType === 'Холодильник' ? styles.radioButtonSelectedText : styles.radioButtonText}>
              ❄️ Холодильник
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.radioButton, 
              equipmentType === 'Морозильник' && styles.radioButtonSelected
            ]}
            onPress={() => setEquipmentType('Морозильник')}
          >
            <Text style={equipmentType === 'Морозильник' ? styles.radioButtonSelectedText : styles.radioButtonText}>
              🧊 Морозильник
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Производитель *</Text>
        <TextInput
          style={styles.input}
          value={manufacturer}
          onChangeText={setManufacturer}
          placeholder="Например: ColdTech"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Местоположение *</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Например: Склад №1"
        />
      </View>

      <View style={styles.buttonGroup}>
        <Button 
          title={loading ? "Добавление..." : "📥 Добавить оборудование"} 
          onPress={addEquipment}
          color="#28a745"
          disabled={loading}
        />
      </View>

      <Text style={styles.note}>* - обязательные поля</Text>
      <Text style={styles.note}>После добавления для оборудования автоматически сгенерируется QR-код</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
    padding: 12,
    margin: 4,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  radioButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
  },
  radioButtonText: {
    color: '#333',
  },
  radioButtonSelectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonGroup: {
    marginTop: 20,
    marginBottom: 10,
  },
  note: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 12,
    marginTop: 5,
  },
});