import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private active?: HTMLIonToastElement;

  constructor(private readonly toast:ToastController){}

  async show(
      message:string, 
      duration:number = 1500, 
      position:PositionType = 'bottom', 
      color:ColorType = 'success'
    ){
    // Dismiss previous toast to avoid stacking
    await this.active?.dismiss();

    const toast = await this.toast.create({
      message: message,
      duration: duration,
      position: position,
      color: color,
    });
    this.active = toast;
    await toast.present();
  }

  async showError(message: string, duration: number = 2200, position: PositionType = 'bottom') {
    await this.show(message, duration, position, 'danger');
  }

  async dismiss() {
    await this.active?.dismiss();
    this.active = undefined;
  }
}

type PositionType = 'top' | 'middle' | 'bottom';
type ColorType = 'success' | 'warning' | 'danger';
