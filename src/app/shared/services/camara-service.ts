import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ToastService } from './toast-service';
import { IImage } from 'src/app/interfaces/iimage';

@Injectable({
  providedIn: 'root'
})
export class CamaraService {

  constructor(private readonly toast: ToastService) {}

  async requestPermissions() {
    try {
      await Camera.requestPermissions();
      this.toast.show('Permisos concedidos');
    } catch (error) {
      this.toast.show('Permisos no concedidos', 1500, 'bottom', 'danger');
    }
  }

  async getImageFromCamera(): Promise<IImage | undefined> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      const base64Data = await this.blobToBase64(blob);
      const contentType = blob.type; // ✅ Tipo MIME real

      const fileName = `photo_${Date.now()}.${image.format}`;

      return {
        name: fileName,
        webPath: image.webPath || '',
        base64: base64Data,
        contentType: contentType,
      };
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      return;
    }
  }

  async getImageFromGallery(): Promise<IImage | undefined> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      const base64Data = await this.blobToBase64(blob);
      const contentType = blob.type; // ✅ Tipo MIME real

      const fileName = `photo_${Date.now()}.${image.format}`;

      return {
        name: fileName,
        webPath: image.webPath || '',
        base64: base64Data,
        contentType: contentType,
      };
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      return;
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

}

