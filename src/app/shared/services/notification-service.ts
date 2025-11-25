import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { ToastService } from './toast-service';
import { INotificarion } from 'src/app/interfaces/inotification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly toast:ToastService){}

  async createNotification(noti:any){
    const {error} = await Supabase.from(Const.TB_NOTIFICATION).insert(noti);
    if (error) {
      console.log(error);
      return;
    }
  }

  async getNotificationByIdUser(id:number){
    const {data, error} = 
      await Supabase.from(Const.TB_NOTIFICATION)
      .select('*').eq('user_id', id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return [];
    }
    return data as INotificarion[];
  }
  
}
