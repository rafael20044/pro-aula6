import { Component, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { AuthService } from 'src/app/shared/services/auth-service';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { ToastService } from 'src/app/shared/services/toast-service';
<<<<<<< HEAD
import { Supabase } from 'src/app/core/supabase/supabase';
import { AuthStateService } from 'src/app/core/auth/auth-state';


=======
import { UserService } from 'src/app/shared/services/user-service';
>>>>>>> 01dff7b36dbe6340d8ddf77e7639d7589772f79d

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
<<<<<<< HEAD
    private readonly toat: ToastService,
    private readonly auth: AuthService,
    private readonly local: LocalStorageService,
    private readonly router: Router,
    private readonly state: AuthStateService,
    private readonly ngZone: NgZone,
=======
    private readonly toat:ToastService, 
    private readonly auth:AuthService,
    private readonly local:LocalStorageService,
    private readonly router:Router,
    private readonly user:UserService
>>>>>>> 01dff7b36dbe6340d8ddf77e7639d7589772f79d
  ) {}

  async submit() {
  if (!this.form.valid) {
    this.toat.show('Rellene los campos correctamente', 1500, 'bottom', 'warning');
    return;
  }

<<<<<<< HEAD
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
=======
  const { email, password } = this.form.value;
  const uid = await this.auth.loginWithEmailAndPassword(email || '', password || '');
  if (!uid){
    this.toat.show('Error al autenticar', 150, 'bottom', 'danger');
    return;
  }

  // MOCK de rol local (luego reemplazas por consulta real)
  const role = await this.auth.isAdmin(uid);
  const id = await this.user.findIdByUid(uid);

  this.local.set(Const.USER_UID, uid);
  this.local.set(Const.USER_ID, id);

  this.router.navigate([ role ? '/admin/home' : '/home' ]);
>>>>>>> 01dff7b36dbe6340d8ddf77e7639d7589772f79d
}
}
