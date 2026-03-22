import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

// Определяем тип для результата сканирования
interface BarcodeScanResult {
  type: string;
  data: string;
  cornerPoints?: {
    x: number;
    y: number;
  }[];
}

const { width: screenWidth } = Dimensions.get('window');

export default function QRScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [scannedType, setScannedType] = useState<string>('');
  const cameraRef = useRef(null);
  const navigation = useNavigation<any>();

  // Запрашиваем разрешение на использование камеры
  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission(false);
      }
    };

    getCameraPermissions();
  }, []);

  // Обработка сканирования QR-кода
  const handleBarCodeScanned = (result: BarcodeScanResult) => {
    if (scanned) return;
    
    setScanned(true);
    setScannedData(result.data);
    setScannedType(result.type);
    setShowModal(true);
  };

  const handleEdit = () => {
    setShowModal(false);
    // Даем время на закрытие модального окна перед навигацией
    setTimeout(() => {
      // Передаем данные в экран редактирования
      navigation.navigate('EditEquipment', { 
        equipmentId: scannedData,
        scanData: scannedData 
      });
      // Сбрасываем состояние сканирования после навигации
      setTimeout(() => {
        setScanned(false);
      }, 100);
    }, 100);
  };

  const handleCancel = () => {
    setShowModal(false);
    // Сбрасываем состояние сканирования после закрытия модалки
    setTimeout(() => {
      setScanned(false);
    }, 100);
  };

  const handleScanAgain = () => {
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Запрос разрешения для камеры...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Нет доступа к камере. Пожалуйста, разрешите доступ в настройках.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'] as const,
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>Наведите на QR-код оборудования</Text>
        </View>
      </CameraView>
      
      {/* Кнопка "Сканировать снова" появляется только если нет модального окна */}
      {scanned && !showModal && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
          <Text style={styles.scanAgainButtonText}>Сканировать снова</Text>
        </TouchableOpacity>
      )}

      {/* Кастомное модальное окно вместо Alert */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCancel}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>✅</Text>
            </View>
            <Text style={styles.modalTitle}>QR-код отсканирован!</Text>
            <Text style={styles.modalSubtitle}>Тип: {scannedType.toUpperCase()}</Text>
            <View style={styles.modalDataContainer}>
              <Text style={styles.modalDataLabel}>Данные:</Text>
              <Text style={styles.modalData} numberOfLines={3}>
                {scannedData}
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.editButton]} 
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Text style={styles.editButtonText}>Редактировать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
    color: '#666',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: screenWidth - 48,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalDataContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 20,
  },
  modalDataLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  modalData: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});