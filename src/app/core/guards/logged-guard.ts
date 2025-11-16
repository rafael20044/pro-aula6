import { Inject, inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state';
import { Supabase } from '../supabase/supabase';

@Injectable({ providedIn: 'root' })
export class LoggedGuard implements CanActivate {
  constructor(private state: AuthStateService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const {data, error} = await Supabase.auth.getSession();
    if (error) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const session = data.session;

    if (!session) {
      return false;
    }

    this.router.navigate(['/auth/login']);
    return true;
  }
}
