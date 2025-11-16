import { Inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';

export const welcomeGuard: CanActivateFn = (route, state) => {
  const local:LocalStorageService = Inject(LocalStorageService);
  const router:Router = Inject(Router);
  const showWelcome = local.get(Const.SHOW_WELCOME);
  if (showWelcome) {
    router.navigate(['/welcome']);
    return false;
  }
  return true;
};
