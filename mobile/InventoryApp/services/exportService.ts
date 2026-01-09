// services/exportService.ts
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

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

export class ExportService {
  // 📤 ЭКСПОРТ В CSV ФАЙЛ (через PDF для простоты)
  static async exportToCSV(equipmentList: Equipment[]): Promise<void> {
    try {
      if (!equipmentList || equipmentList.length === 0) {
        Alert.alert('Ошибка', 'Нет данных для экспорта');
        return;
      }

      console.log('📊 Начинаем экспорт данных в CSV...');

      // Создаем CSV содержимое
      const csvContent = this.generateCSVContent(equipmentList);
      
      // Предлагаем пользователю выбор
      Alert.alert(
        '📊 Экспорт CSV данных',
        `Выберите способ экспорта ${equipmentList.length} единиц оборудования:`,
        [
          {
            text: '📋 Скопировать в буфер',
            onPress: () => this.copyToClipboard(csvContent, equipmentList.length)
          },
          {
            text: '📄 Создать PDF отчет',
            onPress: () => this.exportCSVAsPDF(equipmentList)
          },
          {
            text: '📱 Показать в консоли',
            onPress: () => this.showInConsole(csvContent, equipmentList.length)
          },
          {
            text: 'Отмена',
            style: 'cancel'
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Ошибка экспорта:', error);
      Alert.alert('Ошибка экспорта', 'Не удалось экспортировать данные');
    }
  }

  // 📄 ЭКСПОРТ В PDF
  static async exportToPDF(equipmentList: Equipment[]): Promise<void> {
    try {
      if (!equipmentList || equipmentList.length === 0) {
        Alert.alert('Ошибка', 'Нет данных для экспорта');
        return;
      }

      console.log('📊 Начинаем экспорт данных в PDF...');

      const htmlContent = this.generatePDFHTML(equipmentList);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Экспорт оборудования в PDF',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Ошибка', 'Общий доступ недоступен на этом устройстве');
      }

      console.log('✅ PDF успешно создан и доступен для общего доступа');
      
    } catch (error) {
      console.error('❌ Ошибка экспорта PDF:', error);
      Alert.alert('Ошибка', 'Не удалось создать PDF файл');
    }
  }

  // 🖨️ ГЕНЕРАЦИЯ QR-КОДА ДЛЯ ПЕЧАТИ В PDF
  static async generateQRForPrint(equipment: Equipment): Promise<void> {
    try {
      if (!equipment) {
        Alert.alert('Ошибка', 'Нет данных об оборудовании');
        return;
      }

      console.log('🖨️ Генерация QR-кода для печати...');

      const htmlContent = this.generateQRHTML(equipment);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `QR-код: ${equipment.model_name || 'Оборудование'}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Ошибка', 'Общий доступ недоступен на этом устройстве');
      }

      console.log('✅ QR-код успешно создан и доступен для печати');
      
    } catch (error) {
      console.error('❌ Ошибка генерации QR-кода:', error);
      Alert.alert('Ошибка', 'Не удалось сгенерировать QR-код для печати');
    }
  }

  // 📋 КОПИРОВАНИЕ В БУФЕР ОБМЕНА
  private static async copyToClipboard(csvContent: string, itemCount: number): Promise<void> {
    try {
      await Clipboard.setStringAsync(csvContent);
      Alert.alert(
        '✅ Успешно скопировано',
        `Данные ${itemCount} единиц оборудования скопированы в буфер обмена.\n\nВставьте в Excel или текстовый редактор и сохраните как .csv файл.`
      );
      console.log('✅ Данные скопированы в буфер обмена');
    } catch (error) {
      console.error('❌ Ошибка копирования:', error);
      this.showInConsole(csvContent, itemCount);
    }
  }

  // 📊 ЭКСПОРТ CSV КАК PDF
  private static async exportCSVAsPDF(equipmentList: Equipment[]): Promise<void> {
    try {
      const htmlContent = this.generateCSVPDFHTML(equipmentList);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Отчет по оборудованию (CSV данные)',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Ошибка', 'Общий доступ недоступен на этом устройстве');
      }
    } catch (error) {
      console.error('❌ Ошибка создания PDF:', error);
      Alert.alert('Ошибка', 'Не удалось создать PDF файл');
    }
  }

  // 📱 ПОКАЗАТЬ В КОНСОЛИ
  private static showInConsole(csvContent: string, itemCount: number): void {
    console.log('====== CSV ДАННЫХ ДЛЯ ЭКСПОРТА ======');
    console.log(csvContent);
    console.log('=====================================');
    Alert.alert(
      '📱 Данные в консоли',
      `Данные ${itemCount} единиц оборудования выведены в консоль.\n\nСкопируйте их и сохраните в файл с расширением .csv`
    );
  }

  // 📄 ГЕНЕРАЦИЯ CSV СОДЕРЖИМОГО
  private static generateCSVContent(equipmentList: Equipment[]): string {
    const headers = 'ID,Серийный номер,Модель,Тип оборудования,Производитель,Местоположение,QR код,Дата добавления\n';
    
    const rows = equipmentList.map(item => {
      const id = item.id || 0;
      const serial = this.escapeCSV(item.serial_number || '');
      const model = this.escapeCSV(item.model_name || '');
      const type = this.escapeCSV(item.equipment_type || '');
      const manufacturer = this.escapeCSV(item.manufacturer || '');
      const location = this.escapeCSV(item.location || '');
      const qrCode = this.escapeCSV(item.qr_code_data ? 'Есть' : 'Нет');
      const createdAt = this.escapeCSV(this.formatDate(item.created_at) || '');

      return `${id},"${serial}","${model}","${type}","${manufacturer}","${location}","${qrCode}","${createdAt}"`;
    }).join('\n');
    
    return headers + rows;
  }

  // 🎨 ГЕНЕРАЦИЯ HTML ДЛЯ PDF С CSV ДАННЫМИ
  private static generateCSVPDFHTML(equipmentList: Equipment[]): string {
    const currentDate = new Date().toLocaleDateString('ru-RU');
    const csvContent = this.generateCSVContent(equipmentList);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>CSV данные оборудования</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; color: #333; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          .instructions { background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .csv-content { background-color: #f9f9f9; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; font-size: 12px; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f0f8ff; border-radius: 5px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">CSV ДАННЫЕ ОБОРУДОВАНИЯ</div>
          <div class="subtitle">Сгенерировано: ${currentDate}</div>
        </div>
        
        <div class="instructions">
          <strong>Инструкция по использованию:</strong><br>
          1. Скопируйте данные ниже<br>
          2. Вставьте в Excel или текстовый редактор<br>
          3. Сохраните с расширением .csv<br>
          4. Или импортируйте в систему учета
        </div>
        
        <div class="csv-content">${csvContent}</div>
        
        <div class="summary">
          <strong>Итого:</strong> ${equipmentList.length} единиц оборудования
        </div>
        
        <div class="footer">
          Система управления оборудованием • ${currentDate}
        </div>
      </body>
      </html>
    `;
  }

  // 🎨 ГЕНЕРАЦИЯ HTML ДЛЯ PDF ОТЧЕТА
  private static generatePDFHTML(equipmentList: Equipment[]): string {
    const currentDate = new Date().toLocaleDateString('ru-RU');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Отчет по оборудованию</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; color: #333; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f0f8ff; border-radius: 5px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">ОТЧЕТ ПО ОБОРУДОВАНИЮ</div>
          <div class="subtitle">Сгенерировано: ${currentDate}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Серийный номер</th>
              <th>Модель</th>
              <th>Тип</th>
              <th>Производитель</th>
              <th>Местоположение</th>
              <th>QR-код</th>
            </tr>
          </thead>
          <tbody>
            ${equipmentList.map(item => `
              <tr>
                <td>${item.id}</td>
                <td>${item.serial_number || '-'}</td>
                <td>${item.model_name || '-'}</td>
                <td>${item.equipment_type || '-'}</td>
                <td>${item.manufacturer || '-'}</td>
                <td>${item.location || '-'}</td>
                <td>${item.qr_code_data ? '✓' : '✗'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <strong>Итого:</strong> ${equipmentList.length} единиц оборудования
        </div>
        
        <div class="footer">
          Система управления оборудованием • ${currentDate}
        </div>
      </body>
      </html>
    `;
  }

  // 🎨 ГЕНЕРАЦИЯ HTML ДЛЯ QR-КОДА
  private static generateQRHTML(equipment: Equipment): string {
    const currentDate = new Date().toLocaleDateString('ru-RU');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>QR-код оборудования</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; color: #333; }
          .qr-container { margin: 30px 0; padding: 20px; border: 1px dashed #ccc; }
          .qr-image { max-width: 300px; max-height: 300px; margin: 0 auto; }
          .info { text-align: left; margin: 20px auto; max-width: 400px; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #333; }
          .instructions { margin-top: 30px; padding: 15px; background-color: #f0f8ff; border-radius: 5px; text-align: left; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">QR-КОД ОБОРУДОВАНИЯ</div>
        </div>
        
        <div class="info">
          <div class="info-item"><span class="label">Модель:</span> ${equipment.model_name || 'Не указана'}</div>
          <div class="info-item"><span class="label">Серийный номер:</span> ${equipment.serial_number || 'Не указан'}</div>
          <div class="info-item"><span class="label">Тип:</span> ${equipment.equipment_type || 'Не указан'}</div>
          <div class="info-item"><span class="label">Производитель:</span> ${equipment.manufacturer || 'Не указан'}</div>
          <div class="info-item"><span class="label">Местоположение:</span> ${equipment.location || 'Не указано'}</div>
          <div class="info-item"><span class="label">ID в системе:</span> ${equipment.id || 'Не указан'}</div>
        </div>
        
        ${equipment.qr_code_data ? `
          <div class="qr-container">
            <div><strong>QR-КОД ДЛЯ СКАНИРОВАНИЯ</strong></div>
            <img class="qr-image" src="${equipment.qr_code_data}" alt="QR Code" />
          </div>
        ` : '<div style="color: red; margin: 20px 0;">QR-код не сгенерирован</div>'}
        
        <div class="instructions">
          <strong>Инструкция по печати и использованию:</strong><br>
          1. Распечатайте этот документ<br>
          2. Вырежьте QR-код по контуру<br>
          3. Наклейте на оборудование<br>
          4. Отсканируйте для получения информации<br>
          5. QR-код содержит ID: ${equipment.id}
        </div>
        
        <div class="footer">
          Сгенерировано: ${currentDate} • Система управления оборудованием
        </div>
      </body>
      </html>
    `;
  }

  private static escapeCSV(value: string): string {
    if (!value) return '';
    return value.replace(/"/g, '""');
  }

  private static formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  }

  // 🔧 Функция для отладки
  static debugEquipmentData(equipmentList: Equipment[]): void {
    console.log('====== ДЕБАГ ДАННЫХ ОБОРУДОВАНИЯ ======');
    equipmentList.forEach((item, index) => {
      console.log(`[${index}] ID: ${item.id}`);
      console.log(`    Модель: ${item.model_name}`);
      console.log(`    Тип: ${item.equipment_type}`);
      console.log(`    Производитель: ${item.manufacturer}`);
      console.log(`    Серийный: ${item.serial_number}`);
      console.log(`    Локация: ${item.location}`);
      console.log(`    QR: ${item.qr_code_data ? 'Есть' : 'Нет'}`);
      console.log('---');
    });
    console.log('====================================');
  }
}