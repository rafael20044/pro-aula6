import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {

  }

  async upload(bucket: string, folder: string, name: string, da: string, contentType: string) {
    const path = `${folder}/${name}`;
    //console.log(`path que se crea entes de meterlo a supabase ${path}`)
    const { data, error } = await Supabase.storage.from(bucket).upload(path, this.base64ToArrayBuffer(da), {
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
    const { data, error } = await Supabase.storage.from(bucket).createSignedUrl(path, 9000000);
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

  private base64ToArrayBuffer(base64: string) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

}
