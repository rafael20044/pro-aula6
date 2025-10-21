import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { ToastService } from './toast-service';
import { Const } from 'src/app/const/const';
import { ITicket, ITicketFind } from 'src/app/interfaces/iticket';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(
    private readonly toast: ToastService
  ) { }

  async createUser(user: any) {
    const { data, error } = await Supabase.from('users').insert(user);

    if (error) {
      // this.toast.show('Error al guardar los datos', 1500, 'bottom', 'warning');
      return false;
    }

    return true;
  }

  async countAllUser() {
    const { data, error } = await Supabase.from(Const.TB_USER).select('id');
    if (error) {
      console.log(error);
      return 0;
    }
    return data.length;
  }

  //todos los tickets sin resolver
  async countAllTickets() {
    const { data, error } = await Supabase.from(Const.TB_TICKETS).select('id').eq('status', false);
    if (error) {
      console.log(error);
      return 0;
    }
    return data.length;
  }

  async findAllTickets() {
    const { data, error } = await Supabase
      .from(Const.TB_TICKETS)
      .select('*')
      .eq('status', false);

    if (error) {
      console.log(error);
      return [];
    }

    const tickets = data as ITicket[];

    const ticketsFind: ITicketFind[] = await Promise.all(
      tickets.map(async (t) => {
        const name = await this.findNameUser(t.user_id);
        return {
          body: t.body,
          created_at: t.created_at,
          id: t.id,
          name_user_id: name || 'Desconocido',
          status: t.status,
          user_id: t.user_id,
          answers_id: t.answers_id,
          question_id: t.question_id,
          user_report_id: t.user_report_id
        };
      })
    );

    return ticketsFind;
  }

  private async findNameUser(id: number) {
    const { data, error } = await Supabase.from(Const.TB_USER).select('name, last_name').eq('id', id);
    if (error) {
      console.log(error);
      return;
    }
    const result = data[0];
    return `${result.name} ${result.last_name}`;
  }
}
