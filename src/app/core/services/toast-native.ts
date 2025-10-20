import { Injectable } from '@angular/core';
import { Toast } from '@capacitor/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastNative {
  constructor() { }

  async showToast(text: string, duration: DurationType) {
    await Toast.show({
      text: text,
      duration: duration
    });
  }
}

type DurationType = 'short'| 'long';
