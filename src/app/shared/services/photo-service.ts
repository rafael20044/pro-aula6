import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { StorageService } from './storage-service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService
  ) { }


  async resolvePhotoUrl(rawPhoto: string | null | undefined, bucket: string = Const.BUCKET): Promise<string | null> {
    if (!rawPhoto) {
      return null;
    }

    if (typeof rawPhoto === 'string' && rawPhoto.startsWith('http')) {
      return rawPhoto;
    }

    // Crear clave de caché única
    const cacheKey = `${bucket}:${rawPhoto}`;
    
    // Intentar obtener del caché primero
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const signed = await this.storageService.getSignUrl(bucket, rawPhoto);
      const url = signed?.url || null;
      
      // Guardar en caché si se obtuvo correctamente
      if (url) {
        this.cacheService.set(cacheKey, url);
      }
      
      return url;
    } catch (err) {
      console.error('Error resolving photo URL:', err);
      return null;
    }
  }

  async resolveMultiplePhotos(photos: (string | null | undefined)[], bucket: string = Const.BUCKET): Promise<(string | null)[]> {
    // Procesar todas las fotos en paralelo
    const promises = photos.map(photo => this.resolvePhotoUrl(photo, bucket));
    return Promise.all(promises);
  }

  async resolveImageUrls(images: Array<{ image_url?: string | null, path?: string | null }>, bucket: string = Const.BUCKET): Promise<string[]> {
    // Optimización: procesar todas las imágenes en paralelo en lugar de secuencialmente
    const promises = images.map(async (img) => {
      const candidate = img.image_url || img.path;
      return this.resolvePhotoUrl(candidate, bucket);
    });
    
    const results = await Promise.all(promises);
    // Filtrar nulls
    return results.filter((url): url is string => url !== null);
  }

  async isUrlValid(url: string): Promise<boolean> {
    return this.storageService.isSignedUrlValid(url);
  }
}
