import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'user' | 'admin' | null;

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private uid$ = new BehaviorSubject<string | null>(localStorage.getItem('USER_UID'));
  private role$ = new BehaviorSubject<UserRole>((localStorage.getItem('USER_ROLE') as UserRole) ?? null);

  uidChanges = this.uid$.asObservable();
  roleChanges = this.role$.asObservable();

  get uid() { return this.uid$.value; }
  get role() { return this.role$.value; }
  get isLoggedIn() { return !!this.uid$.value; }

  setSession(uid: string, role: UserRole) {
    localStorage.setItem('USER_UID', uid);
    if (role) localStorage.setItem('USER_ROLE', role);
    this.uid$.next(uid);
    this.role$.next(role);
  }

  clear() {
    localStorage.removeItem('USER_UID');
    localStorage.removeItem('USER_ROLE');
    this.uid$.next(null);
    this.role$.next(null);
  }
}
