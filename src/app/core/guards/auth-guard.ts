import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';

export const authGuard: CanActivateFn = (route, state) => {

  const local: LocalStorageService = inject(LocalStorageService);
  const router: Router = inject(Router);
  const uid = local.get(Const.USER_UID);

  if (!uid) {
    router.navigate(['/auth/login']);
    return false;
  }
  return true;
};
