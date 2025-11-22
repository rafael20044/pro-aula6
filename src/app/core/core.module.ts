import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { FilePickerService } from './services/file-picker-service';
import { LocalStorageService } from '../shared/services/local-storage-service';
import { Const } from '../const/const';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule implements OnInit{ 
  constructor(private readonly file:FilePickerService, private readonly local:LocalStorageService){
    this.ngOnInit();
  }

  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      this.file.permission();
    }
    const showWelcome = this.local.get(Const.SHOW_WELCOME);
    if (!showWelcome) {
      this.local.set(Const.SHOW_WELCOME, true);
    }
  }
}
