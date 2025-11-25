import { Component, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { AuthService } from 'src/app/shared/services/auth-service';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { NotificationService } from 'src/app/shared/services/notification-service';
import { ToastService } from 'src/app/shared/services/toast-service';
import { UserService } from 'src/app/shared/services/user-service';

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
    private readonly toat:ToastService, 
    private readonly auth:AuthService,
    private readonly local:LocalStorageService,
    private readonly router:Router,
    private readonly user:UserService,
    private readonly notification:NotificationService  
  ) {}

  async submit() {
  if (!this.form.valid) {
    this.toat.show('Rellene los campos correctamente', 1500, 'bottom', 'warning');
    return;
  }

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
  this.local.set(Const.IS_ADMIN, role);
  this.notification.initListener();
  this.router.navigate([ role ? '/admin/home' : '/home' ]);
}
}
