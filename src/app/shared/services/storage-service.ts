import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  async upload(bucket: string, folder: string, name: string, da: string, contentType: string) {
    const path = `${folder}/${name}`;
    //console.log(`path que se crea entes de meterlo a supabase ${path}`)
    const { data, error } = await Supabase.storage.from(bucket).upload(path, da, {
      contentType: contentType
    });
    if (error) {
      console.log(error.message);
      return;
    }
    //console.log(`path que da el data como resultado ${path}`)
    return await this.getSignUrl(bucket, data.path);
  }

  async getSignUrl(bucket: string, path: string): Promise<{ url: string, path: string } | undefined> {
    //console.log(`path que le mandamos a la funcion para firmar ${path}`)
    const { data, error } = await Supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (error) {
      console.log(error.message);
      return;
    }
    return {
      url: data?.signedUrl || '',
      path: path,
    };
  }

  async isSignedUrlValid(url: string) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch (err) {
      return false;
    }
  }

}
