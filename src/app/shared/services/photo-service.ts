import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { StorageService } from './storage-service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private readonly storageService: StorageService) { }


  async resolvePhotoUrl(rawPhoto: string | null | undefined, bucket: string = Const.BUCKET): Promise<string | null> {
    if (!rawPhoto) {
      return null;
    }

    if (typeof rawPhoto === 'string' && rawPhoto.startsWith('http')) {
      return rawPhoto;
    }

    try {
      const signed = await this.storageService.getSignUrl(bucket, rawPhoto);
      return signed?.url || null;
    } catch (err) {
      console.error('Error resolving photo URL:', err);
      return null;
    }
  }

  async resolveMultiplePhotos(photos: (string | null | undefined)[], bucket: string = Const.BUCKET): Promise<(string | null)[]> {
    const promises = photos.map(photo => this.resolvePhotoUrl(photo, bucket));
    return Promise.all(promises);
  }

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

  async isUrlValid(url: string): Promise<boolean> {
    return this.storageService.isSignedUrlValid(url);
  }
}
