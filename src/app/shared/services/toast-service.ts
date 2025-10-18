import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private readonly toast:ToastController){}

  async show(
      message:string, 
      duration:number = 1500, 
      position:PositionType = 'bottom', 
      color:ColorType = 'success'
    ){
    const toast = await this.toast.create({
      message: message,
      duration: duration,
      position: position,
      color: color,
    });
    await toast.present();
  }
}

type PositionType = 'top' | 'middle' | 'bottom';
type ColorType = 'success' | 'warning' | 'danger';
