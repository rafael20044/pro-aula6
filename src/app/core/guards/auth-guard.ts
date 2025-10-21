import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state';
import { Supabase } from '../supabase/supabase';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private state: AuthStateService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    if (this.state.uid) return true;

    const { data } = await Supabase.auth.getUser();
    if (data.user?.id) return true;

    this.router.navigate(['/auth/login']);
    return false;
  }
}
