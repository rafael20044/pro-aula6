import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class LocalNotification {
  
  constructor(){}

  async requestPermissions(){
    await LocalNotifications.requestPermissions();
  }

  async send(){
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: 'Nueva notificacion',
          body: 'Tienes un anueva notificacion',
          schedule: {at: new Date(Date.now() + 1000)}
        }
      ]
    });
  }
}
