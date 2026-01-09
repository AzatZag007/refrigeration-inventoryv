import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

const { width, height } = Dimensions.get('window');

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Запрашиваем разрешение на использование камеры
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  // Обработка сканирования QR-кода
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setLoading(true);

    try {
      console.log('📱 Отсканирован QR-код:', data);
      
      // Отправляем данные QR-кода на сервер
      const response = await fetch('http://192.168.1.186:5000/api/equipment/qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: data
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          '✅ Оборудование найдено!',
          `Модель: ${result.model_name}\nСерийный: ${result.serial_number}\nМестоположение: ${result.location}`,
          [
            { 
              text: 'Отлично', 
              onPress: () => setScanned(false) 
            }
          ]
        );
      } else {
        Alert.alert(
          '❌ Ошибка',
          result.error || 'Оборудование не найдено',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('Ошибка при обработке QR-кода:', error);
      Alert.alert(
        '❌ Ошибка',
        'Не удалось подключиться к серверу',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Запрос разрешения для камеры...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>❌ Нет доступа к камере</Text>
        <Text style={styles.errorSubtext}>
          Для сканирования QR-кодов необходимо разрешить доступ к камере в настройках устройства
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Поиск оборудования...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Сканирование QR-кода</Text>
      <Text style={styles.subtitle}>Наведите камеру на QR-код оборудования</Text>
      
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        
        {/* Оверлей поверх камеры */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>Сканирование...</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          📍 Найдите QR-код на оборудовании и наведите камеру
        </Text>
        <Text style={styles.infoText}>
          🔍 Автоматическое сканирование
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'gray',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative', // Для позиционирования оверлея
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
});