import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginPage } from './login.page';
import { LoginPageRoutingModule } from './login-routing.module';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  imports: [CommonModule, IonicModule, ReactiveFormsModule, SharedModule, LoginPageRoutingModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}
