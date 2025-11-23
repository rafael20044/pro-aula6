import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { Const } from 'src/app/const/const';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  async getUsers() {
    const { data, error } = await Supabase
      .from(Const.TB_USER)
      .select('*')
      .neq('rol', 'admin') // Exclude admins
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data || [];
  }

  async toggleUserBan(userId: string, currentStatus: boolean) {
    console.log(`Toggling ban for user ${userId}. Current: ${currentStatus}, New: ${!currentStatus}`);
    const { data, error } = await Supabase
      .from(Const.TB_USER)
      .update({ is_banned: !currentStatus })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error toggling user ban:', error);
    } else {
      console.log('User ban toggled successfully:', data);
    }

    return { data, error };
  }

  async updateUser(userId: string, userData: any) {
    console.log(`Updating user ${userId} with data:`, userData);
    const { data, error } = await Supabase
      .from(Const.TB_USER)
      .update(userData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user:', error);
    } else {
      console.log('User updated successfully:', data);
    }

    return { data, error };
  }

  async getDashboardStats() {
    const { count: userCount } = await Supabase
      .from(Const.TB_USER)
      .select('*', { count: 'exact', head: true });

    const { count: ticketCount } = await Supabase
      .from(Const.TB_TICKETS)
      .select('*', { count: 'exact', head: true })
      .eq('status', false);

    return {
      users: userCount || 0,
      reports: ticketCount || 0,
      activeToday: 0
    };
  }
}
