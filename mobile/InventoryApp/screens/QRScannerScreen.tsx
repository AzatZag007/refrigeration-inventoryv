import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { API_CONFIG } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CustomAlertModal from '../components/CustomAlertModal'; // Импортируем кастомный модал

const { width, height } = Dimensions.get('window');

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Состояния для модального окна
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    buttons: [] as { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[],
  });
  
  const [scanResult, setScanResult] = useState<any>(null); // Сохраняем результат сканирования
  
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const cameraRef = useRef<CameraView>(null);

  // Запрашиваем разрешение на использование камеры
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  // Сброс состояния при возврате на экран
  useFocusEffect(
    React.useCallback(() => {
      // Сбрасываем все состояния при возврате на экран
      setScanned(false);
      setLoading(false);
      setCameraActive(true);
      setIsProcessing(false);
      setModalVisible(false);
      
      return () => {
        // При уходе с экрана отключаем камеру
        setCameraActive(false);
        setModalVisible(false);
      };
    }, [])
  );

  // Функция для показа кастомного модального окна
  const showAlert = (title: string, message: string, buttons: any[]) => {
    setModalConfig({ title, message, buttons });
    setModalVisible(true);
  };

  // Закрытие модального окна и сброс камеры
  const closeModalAndReset = () => {
    setModalVisible(false);
    // Небольшая задержка перед включением камеры
    setTimeout(() => {
      resetCameraState();
    }, 100);
  };

  // Обработка сканирования QR-кода
  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || loading || isProcessing) return;

    if (!token) {
      showAlert('❌ Ошибка', 'Токен доступа отсутствует. Перезайдите в систему.', [
        { text: 'OK', onPress: () => closeModalAndReset() }
      ]);
      return;
    }
    
    setIsProcessing(true);
    setScanned(true);
    setLoading(true);
    setCameraActive(false);
    
    // Останавливаем превью камеры если возможно
    if (cameraRef.current) {
      try {
        // @ts-ignore
        if (cameraRef.current.pausePreview) {
          // @ts-ignore
          cameraRef.current.pausePreview();
        }
      } catch (e) {
        // Игнорируем
      }
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/equipment/qr-scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ qrData: data }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (response.ok) {
        setScanResult(result);
        
        showAlert(
          '✅ Оборудование найдено!',
          `Модель: ${result?.model_name}\nСерийный: ${result?.serial_number}\nМестоположение: ${result?.location}`,
          [
            {
              text: 'Отмена',
              style: 'cancel',
              onPress: () => {
                closeModalAndReset();
              }
            },
            {
              text: 'Редактировать',
              onPress: () => {
                setModalVisible(false);
                // Сразу переходим к редактированию, камера останется выключенной
                navigation.navigate('EditEquipment', { equipment: result });
                // Сбрасываем состояние после навигации
                setTimeout(() => {
                  resetCameraState();
                }, 500);
              }
            }
          ]
        );
      } else {
        showAlert(
          '❌ Ошибка',
          result?.error || result?.message || 'Оборудование не найдено',
          [{ text: 'OK', onPress: () => closeModalAndReset() }]
        );
      }
    } catch (error) {
      console.error('Ошибка при обработке QR-кода:', error);
      showAlert(
        '❌ Ошибка',
        'Не удалось подключиться к серверу',
        [{ text: 'OK', onPress: () => closeModalAndReset() }]
      );
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  // Функция сброса состояния камеры
  const resetCameraState = () => {
    setScanned(false);
    setCameraActive(true);
    setIsProcessing(false);
    setScanResult(null);
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

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.title}>📷 Сканирование QR-кода</Text>
        <Text style={styles.subtitle}>Наведите камеру на QR-код оборудования</Text>

        <View style={styles.cameraContainer}>
          {cameraActive && !isProcessing && (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              onBarcodeScanned={scanned || loading || isProcessing ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              enableTorch={false}
              zoom={0}
            />
          )}

          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>
              {loading ? 'Поиск оборудования...' : scanned ? 'Обработка...' : 'Сканирование...'}
            </Text>
            {loading && <ActivityIndicator style={{ marginTop: 12 }} size="large" color="#fff" />}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>📍 Найдите QR-код на оборудовании и наведите камеру</Text>
          <Text style={styles.infoText}>🔍 Сканирование происходит автоматически</Text>
          <Text style={styles.infoText}>↩️ После результата нажмите OK и сканируйте следующий</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Кастомное модальное окно вместо Alert */}
      <CustomAlertModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        buttons={modalConfig.buttons}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

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