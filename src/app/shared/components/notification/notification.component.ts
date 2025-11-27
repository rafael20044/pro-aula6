import { Component, OnInit } from '@angular/core';
import { INotificarion } from 'src/app/interfaces/inotification';
import { NotificationService } from '../../services/notification-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Const } from 'src/app/const/const';
import { Router } from '@angular/router';

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
    private readonly router:Router
  ) { }

  async ngOnInit() {
    await this.load();
  }

  async openNotification(id:number, question_id:number){
    await this.notification.markAsRead(id);
    await this.load();
    this.router.navigate([`question-details/${question_id}`]);
  }

  private async load(){
    await this.notification.loadInitialNotifications();
    this.notification.getNotifications().subscribe(list =>{
      this.notifications = list;
    });
    this.notification.initListener();
  }



}
