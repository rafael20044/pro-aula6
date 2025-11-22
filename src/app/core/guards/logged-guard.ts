import { Inject, inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state';
import { Supabase } from '../supabase/supabase';
import { AuthService } from 'src/app/shared/services/auth-service';

@Injectable({ providedIn: 'root' })
export class LoggedGuard implements CanActivate {
  constructor(private state: AuthStateService, private router: Router, private readonly auth: AuthService) {}

  async canActivate(): Promise<boolean> {
    await this.auth.ensureReady();
    const session = this.auth.getSession();
    if (session) {
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
