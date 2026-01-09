import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { API_CONFIG } from '../config/apiConfig';

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
  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    setLoading(true);

    try {
      // ✅ используем конфиг, а не хардкод IP
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/equipment/qr-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: data }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (response.ok) {
        Alert.alert(
          '✅ Оборудование найдено!',
          `Модель: ${result?.model_name}\nСерийный: ${result?.serial_number}\nМестоположение: ${result?.location}`,
          [{ text: 'Отлично', onPress: () => setScanned(false) }]
        );
      } else {
        Alert.alert(
          '❌ Ошибка',
          result?.error || result?.message || 'Оборудование не найдено',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('Ошибка при обработке QR-кода:', error);
      Alert.alert('❌ Ошибка', 'Не удалось подключиться к серверу', [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
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

  // ✅ при лоадинге тоже оставим скролл (чтобы не прыгал layout)
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Text style={styles.title}>📷 Сканирование QR-кода</Text>
      <Text style={styles.subtitle}>Наведите камеру на QR-код оборудования</Text>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned || loading ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />

        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>
            {loading ? 'Поиск оборудования...' : scanned ? 'Обработka...' : 'Сканирование...'}
          </Text>
          {loading && <ActivityIndicator style={{ marginTop: 12 }} size="large" color="#fff" />}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>📍 Найдите QR-код на оборудовании и наведите камеру</Text>
        <Text style={styles.infoText}>🔍 Сканирование происходит автоматически</Text>
        <Text style={styles.infoText}>↩️ После результата нажмите OK и сканируйте следующий</Text>
      </View>

      {/* ✅ большой нижний отступ, чтобы контент не упирался в TabBar */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // ✅ contentContainerStyle нужен, чтобы реально была прокрутка
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: 'gray',
    paddingHorizontal: 16,
  },

  cameraContainer: {
    // ✅ фиксируем высоту камеры, чтобы scroll работал нормально
    height: Math.min(height * 0.55, 520),
    marginHorizontal: 16,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  scanFrame: {
    width: Math.min(260, width - 80),
    height: Math.min(260, width - 80),
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 16,
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
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
});
