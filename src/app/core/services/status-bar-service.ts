import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Injectable({
  providedIn: 'root'
})
export class StatusBarService {

  constructor(){}

  async statusBar(){
    await StatusBar.setOverlaysWebView({overlay: false});
    await StatusBar.setStyle({style:Style.Dark});
  }
  
}
