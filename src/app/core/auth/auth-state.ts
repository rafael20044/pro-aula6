import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { AuthService } from 'src/app/shared/services/auth-service';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'admin' | 'user';
type SessionState = {
  uid: string | null;
  role: UserRole | null;
  email?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private _state$ = new BehaviorSubject<SessionState>({
    uid: null,
    role: null,
    email: null,
  });
  state$ = this._state$.asObservable();

  get uid() {
    return this._state$.value.uid;
  }
  get role() {
    return this._state$.value.role;
  }

  constructor(private readonly authService: AuthService) {
    this.bootstrap();
    Supabase.auth.onAuthStateChange(() => this.bootstrap());
  }

  private async bootstrap() {
    await this.authService.ensureReady();
    const u = this.authService.getUser();
    const uid = u?.id ?? null;
    const email = u?.email ?? null;

    let role: UserRole | null = null;
    if (uid) {
      const { data: userRow, error } = await Supabase.from('users')
        .select('rol')
        .eq('uid', uid)
        .maybeSingle();
      role = (userRow?.rol ?? null) as UserRole | null;
    }
    this._state$.next({ uid, role, email });
  }

  setSession(uid: string, role: UserRole) {
    const curr = this._state$.value;
    this._state$.next({ ...curr, uid, role });
  }
}
