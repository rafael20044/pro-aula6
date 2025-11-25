import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { StorageService } from './storage-service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private readonly storageService: StorageService) { }

  /**
   * Resuelve una foto (URL firmada o path de storage)
   * @param rawPhoto - Puede ser una URL firmada, un path de storage, o null
   * @param bucket - Bucket de storage (por defecto Const.BUCKET)
   * @returns URL firmada o null
   */
  async resolvePhotoUrl(rawPhoto: string | null | undefined, bucket: string = Const.BUCKET): Promise<string | null> {
    if (!rawPhoto) {
      return null;
    }

    // Si ya es una URL firmada válida, devolverla directamente
    if (typeof rawPhoto === 'string' && rawPhoto.startsWith('http')) {
      return rawPhoto;
    }

    // Si es un path de storage, obtener URL firmada
    try {
      const signed = await this.storageService.getSignUrl(bucket, rawPhoto);
      return signed?.url || null;
    } catch (err) {
      console.error('Error resolving photo URL:', err);
      return null;
    }
  }

  /**
   * Resuelve múltiples fotos en paralelo
   * @param photos - Array de fotos (URLs o paths)
   * @param bucket - Bucket de storage
   * @returns Array de URLs firmadas (null para las que fallen)
   */
  async resolveMultiplePhotos(photos: (string | null | undefined)[], bucket: string = Const.BUCKET): Promise<(string | null)[]> {
    const promises = photos.map(photo => this.resolvePhotoUrl(photo, bucket));
    return Promise.all(promises);
  }

  /**
   * Resuelve fotos de imágenes con estructura { image_url, path }
   * @param images - Array de objetos con image_url y path
   * @param bucket - Bucket de storage
   * @returns Array de URLs firmadas
   */
  async resolveImageUrls(images: Array<{ image_url?: string | null, path?: string | null }>, bucket: string = Const.BUCKET): Promise<string[]> {
    const resolved: string[] = [];

    for (const img of images) {
      // Priorizar image_url si existe y es válida
      const candidate = img.image_url || img.path;
      const url = await this.resolvePhotoUrl(candidate, bucket);
      if (url) {
        resolved.push(url);
      }
    }

    return resolved;
  }

  /**
   * Valida si una URL firmada sigue siendo válida
   * @param url - URL firmada a validar
   * @returns true si es válida, false si no
   */
  async isUrlValid(url: string): Promise<boolean> {
    return this.storageService.isSignedUrlValid(url);
  }
}
