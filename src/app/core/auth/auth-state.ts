import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
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

  constructor() {
    this.bootstrap();
    Supabase.auth.onAuthStateChange(() => this.bootstrap());
  }

  private async bootstrap() {
    const { data } = await Supabase.auth.getUser();
    const uid = data.user?.id ?? null;
    const email = data.user?.email ?? null;

    let role: UserRole | null = null;
    if (uid) {
      const { data: u, error } = await Supabase.from('users')
        .select('rol')
        .eq('uid', uid)
        .maybeSingle();
      const role = (u?.rol ?? null) as UserRole | null;
    }
    this._state$.next({ uid, role, email });
  }

  setSession(uid: string, role: UserRole) {
    const curr = this._state$.value;
    this._state$.next({ ...curr, uid, role });
  }
}
