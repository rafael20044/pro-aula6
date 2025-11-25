import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { FilePickerService } from './services/file-picker-service';
import { LocalStorageService } from '../shared/services/local-storage-service';
import { Const } from '../const/const';
import { StatusBarService } from './services/status-bar-service';
import { NotificationService } from '../shared/services/notification-service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class CoreModule implements OnInit{ 
  constructor(
    private readonly file:FilePickerService, 
    private readonly local:LocalStorageService,
    private readonly status:StatusBarService,
    private readonly noti:NotificationService
  ){
    this.ngOnInit();
  }

  async ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      await this.file.permission();
      await this.status.statusBar();
    }
    this.noti.initListener();
    const showWelcome = this.local.get(Const.SHOW_WELCOME);
    if (showWelcome === null) {
      this.local.set(Const.SHOW_WELCOME, true);
    }
  }
}
