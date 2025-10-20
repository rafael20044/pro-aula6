// src/app/core/auth/role.service.ts
import { Injectable } from '@angular/core';
import { AuthStateService, UserRole } from './auth-state';

@Injectable({
  providedIn: 'root'
})
export class Role {
    constructor(private state: AuthStateService) {}

  // MOCK actual (lee LocalStorage/estado). Cambia esto por Supabase luego.
  async getRole(): Promise<UserRole> {
    return this.state.role;
  }

  // Útil para pruebas locales (quita cuando uses Supabase)
  setRole(role: UserRole) {
    if (!this.state.uid) return;
    this.state.setSession(this.state.uid, role);
  }
}
