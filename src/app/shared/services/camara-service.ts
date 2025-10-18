import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { ToastService } from './toast-service';
import { IImage } from 'src/app/interfaces/iimage';

@Injectable({
  providedIn: 'root'
})
export class CamaraService {

  constructor(private readonly toast: ToastService) { }

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
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      const fileName = `photo_${Date.now()}.${image.format}`;

      return {
        name: fileName,
        webPath: image.webPath || '',
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
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      const fileName = `photo_${Date.now()}.${image.format}`;

      return {
        name: fileName,
        webPath: image.webPath || '',
      };
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      return;
    }
  }
}
