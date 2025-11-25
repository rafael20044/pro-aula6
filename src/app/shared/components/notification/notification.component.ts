import { Component, OnInit } from '@angular/core';
import { INotificarion } from 'src/app/interfaces/inotification';
import { NotificationService } from '../../services/notification-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Const } from 'src/app/const/const';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: false,
})
export class NotificationComponent  implements OnInit {

  notifications:INotificarion[] = [];
  userId:number = 0;

  constructor(
    private readonly notification:NotificationService,
    private readonly local:LocalStorageService,
  ) { }

  ngOnInit() {
    this.load();
  }

  openNotification(n:number){
    console.log("holll")
  }

  private async load(){
    await this.notification.loadInitialNotifications();
    this.notification.getNotifications().subscribe(list =>{
      this.notifications = list;
    });
    this.notification.initListener();
  }



}
