import { Component, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { AuthService } from 'src/app/shared/services/auth-service';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { ToastService } from 'src/app/shared/services/toast-service';
import { Supabase } from 'src/app/core/supabase/supabase';
import { AuthStateService } from 'src/app/core/auth/auth-state';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required]);
  form = new FormGroup({
    email: this.emailControl,
    password: this.passwordControl,
  });

  loading = false;

  constructor(
    private readonly toat: ToastService,
    private readonly auth: AuthService,
    private readonly local: LocalStorageService,
    private readonly router: Router,
    private readonly state: AuthStateService,
    private readonly ngZone: NgZone,
  ) {}

  async submit() {
  if (!this.form.valid) {
    this.toat.show('Rellene los campos correctamente', 1500, 'bottom', 'warning');
    return;
  }

  this.loading = true;
  const email = String(this.form.value.email || '');
  const password = String(this.form.value.password || '');

  try {
    // 1) Login
    const uid = await this.auth.loginWithEmailAndPassword(email, password);
    if (!uid) return;

    console.log('[LOGIN] uid=', uid, 'email=', email);

    // 2) Buscar fila de users (uid -> email)
    let dbRow: any | null = null;

    const byUid = await Supabase
      .from('users')
      .select('rol, uid, email')
      .eq('uid', uid)
      .maybeSingle();
    if (!byUid.error && byUid.data) dbRow = byUid.data;

    if (!dbRow) {
      const byEmail = await Supabase
        .from('users')
        .select('rol, uid, email')
        .ilike('email', email)
        .maybeSingle();
      if (!byEmail.error && byEmail.data) dbRow = byEmail.data;
    }

    // 3) Si no hay fila, créala como STUDENT (según tu tabla)
    if (!dbRow) {
      const insert = await Supabase
        .from('users')
        .insert({ uid, email, rol: 'STUDENT', status: 'active' })
        .select('rol, uid, email')
        .maybeSingle();
      if (!insert.error) dbRow = insert.data;
    }

    const dbRoleRaw = String(dbRow?.rol ?? '')
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .trim().toUpperCase();    // ADMIN | STUDENT
    const appRole: 'admin' | 'user' = (dbRoleRaw === 'ADMIN') ? 'admin' : 'user';

    console.log('[LOGIN] dbRow=', dbRow, 'dbRoleRaw=', dbRoleRaw, 'appRole=', appRole);

    // 4) Persistir sesión
    this.local.set(Const.USER_UID, uid);
    try { this.local.set('USER_ROLE', appRole); } catch {}
    localStorage.setItem('USER_UID', uid);
    localStorage.setItem('USER_ROLE', appRole);

    // 5) Estado global
    this.state.setSession(uid, appRole);

    // 6) Navegar dentro de la zona de Angular (evita que no cambie de página)
    const target = (appRole === 'admin') ? '/admin/home' : '/home';
    this.ngZone.run(() => this.router.navigateByUrl(target, { replaceUrl: true }));

    this.toat.show('Sesión iniciada', 1200, 'bottom', 'success');
  } catch (e) {
    console.error(e);
    this.toat.show('No se pudo iniciar sesión', 1500, 'bottom', 'warning');
  } finally {
    this.loading = false;
  }
}
}
