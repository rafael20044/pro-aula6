import { Injectable } from '@angular/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { ToastNative } from './toast-native';
import { IImage } from 'src/app/interfaces/iimage';

@Injectable({
  providedIn: 'root'
})
export class FilePickerService {

  constructor(private toastNative: ToastNative) { }

  async permission() {
    try {
      await FilePicker.requestPermissions();
    } catch (error) {
      await this.toastNative.showToast('error requesting permission ' + error, 'long');
    }
  }

  async pickImage(): Promise<IImage | undefined> {
    try {
      const images = await FilePicker.pickFiles({
        types: ['image/*'],
        limit: 1,
        readData: true,
      });

      const img = images.files[0];
      if (!img) return;

      const byteCharacters = atob(img.data || '');
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: img.mimeType });

      const previewUrl = URL.createObjectURL(blob);

      return {
        data: img.data || '',
        name: img.name,
        mimeType: img.mimeType,
        previewUrl: previewUrl,
      };

    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      return;
    }
  }
}
