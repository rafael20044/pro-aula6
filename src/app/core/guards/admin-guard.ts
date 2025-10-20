// src/app/core/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Role } from '../auth/role';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private roles: Role, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const role = await this.roles.getRole();
    if (role === 'admin') return true;
    this.router.navigate(['/home']);
    return false;
  }
}
