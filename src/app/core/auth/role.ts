import { Injectable } from '@angular/core';
import { AuthStateService, UserRole } from './auth-state';
import { Supabase } from 'src/app/core/supabase/supabase';

@Injectable({ providedIn: 'root' })
export class Role {
  constructor(private state: AuthStateService) {}

  async getRole(): Promise<UserRole> {
    if (this.state.role) return this.state.role;
    const uid = this.state.uid;
    if (!uid) return 'user';
    const { data } = await Supabase.from('users')
      .select('rol')
      .eq('uid', uid)
      .single();
    return (data?.rol ?? 'user') as UserRole;
  }

  async setRole(role: UserRole) {
    const uid = this.state.uid;
    if (!uid) return;
    const { error } = await Supabase.from('users')
      .update({ rol: role })
      .eq('uid', uid);
    if (!error) this.state.setSession(uid, role);
  }
}
