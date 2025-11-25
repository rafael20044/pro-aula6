import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { ToastService } from './toast-service';
import { INotificarion } from 'src/app/interfaces/inotification';
import { LocalStorageService } from './local-storage-service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private channel:any;
  private notifications$ = new BehaviorSubject<INotificarion[]>([]);

  constructor(private readonly toast:ToastService, private readonly local:LocalStorageService){}

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

initListener() {
    const userId = this.local.get(Const.USER_ID);
    if (!userId) return;

    this.channel = Supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as INotificarion;

          const current = this.notifications$.value;
          this.notifications$.next([newNotif, ...current]);
        }
      )
      .subscribe();
  }

  getNotifications() {
    return this.notifications$.asObservable();
  }

  async loadInitialNotifications() {
    const userId = this.local.get(Const.USER_ID);

    const { data } = await Supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    this.notifications$.next(data || []);
  }
  
}
