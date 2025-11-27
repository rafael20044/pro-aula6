import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { INotificarion } from 'src/app/interfaces/inotification';
import { LocalStorageService } from './local-storage-service';
import { BehaviorSubject } from 'rxjs';
import { LocalNotification } from './local-notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private channel: any;
  private notifications$ = new BehaviorSubject<INotificarion[]>([]);

  constructor(
    private readonly local: LocalStorageService,
    private readonly localNoti:LocalNotification
  ) { }

  async createNotification(noti: any) {
    const { error } = await Supabase.from(Const.TB_NOTIFICATION).insert(noti);
    if (error) {
      console.log(error);
      return;
    }
  }


  async markAsRead(id: number) {
    const { error } = await Supabase
      .from(Const.TB_NOTIFICATION)
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.log(error);
    }
  }


  async getNotificationByIdUser(id: number) {
    const { data, error } =
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
          this.localNoti.send();
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
