import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { ITicketFind } from 'src/app/interfaces/iticket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {


  constructor() { }

  async findAllTickets() {
    const { data, error } = await Supabase.rpc('get_tickets_with_users');
    if (error) {
      console.log(error);
      return [];
    }

    return data as ITicketFind[];
  }

  async countAllTickets() {
    const { data, error } = await Supabase.from(Const.TB_TICKETS).select('id').eq('status', false);
    if (error) {
      console.log(error);
      return 0;
    }
    return data.length;
  }
}
