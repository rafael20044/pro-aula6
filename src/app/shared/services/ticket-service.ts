import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class TicketService {


  constructor() { }

  async findAllTickets() {
    const { data, error } = await Supabase
      .from(Const.TB_TICKETS)
      .select(`
        *,
        users!user_id(name, last_name),
        questions(title, body),
        answers(body),
        reported_user:users!user_report_id(name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .eq('status', false);

    if (error) {
      console.log(error);
      return [];
    }

    return data as any[];
  }

  async resolveTicket(id: number) {
    const { error } = await Supabase
      .from(Const.TB_TICKETS)
      .update({ status: true })
      .eq('id', id);

    if (error) {
      console.error('Error resolving ticket:', error);
      return false;
    }
    return true;
  }

  async countAllTickets() {
    const { data, error } = await Supabase.from(Const.TB_TICKETS).select('id').eq('status', false);
    if (error) {
      console.log(error);
      return 0;
    }
    return data.length;
  }

  async createTicket(tick: any) {
    const { error } = await Supabase.from(Const.TB_TICKETS).insert(tick);
    if (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}
