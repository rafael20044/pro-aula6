import { Inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { AuthStateService } from '../auth/auth-state';
import { AuthService } from 'src/app/shared/services/auth-service';

@Injectable({ providedIn: 'root' })
export class WelcomeGuard implements CanActivate {
  constructor(private state: AuthStateService, private router: Router, private readonly local: LocalStorageService) {}

  async canActivate(): Promise<boolean> {
    const showWelcome = this.local.get(Const.SHOW_WELCOME);
    if (showWelcome) {
      this.router.navigate(['/welcome']);
      return false;
    }
    return true;
  }
}
