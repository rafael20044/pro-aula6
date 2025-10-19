import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { AuthService } from 'src/app/shared/services/auth-service';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { ToastService } from 'src/app/shared/services/toast-service';

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

  constructor(
    private readonly toat:ToastService, 
    private readonly auth:AuthService,
    private readonly local:LocalStorageService,
    private readonly router:Router,
  ) {}

  async submit() {
    if (!this.form.valid) {
      this.toat.show('Rellene los campos correctamente', 1500, 'bottom', 'warning');
      return;
    }
    const {email, password} = this.form.value;
    const uid = await this.auth.loginWithEmailAndPassword(email || '', password || '');
    if (uid) {
      this.local.set(Const.USER_UID, uid);
      this.router.navigate(['/home']);
    }
  }
}
