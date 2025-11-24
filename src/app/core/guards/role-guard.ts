import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const local:LocalStorageService = inject(LocalStorageService);
  const router:Router = inject(Router);
  const isAdmin = local.get(Const.IS_ADMIN);

  if (isAdmin) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
