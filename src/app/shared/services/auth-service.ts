import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { ToastService } from './toast-service';
import { Const } from 'src/app/const/const';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private readonly toat:ToastService) { }

  async registerWithEmailAndPassword(email:string, password:string){
    const {data, error} = await Supabase.auth.signUp({email: email, password: password});
    if (error) {
      console.log(error);
      return;
    }
    return data.user?.id;
  }

  async loginWithEmailAndPassword(email:string, password:string){
    const {data, error} = await Supabase.auth.signInWithPassword({email: email, password: password});
    if (error) {
      console.log(error);
      this.toat.show('Correo o contraseña incorrectos', 1500, 'bottom', 'warning');
      return;
    }
    return data.user.id;
  }

  async signOut(){
    await Supabase.auth.signOut();
  }

  async isAdmin(uid:string){
    const {data, error} = await Supabase.from(Const.TB_USER).select('rol').eq('uid', uid).single();
    if (error) {
      return false;
    }
    return data.rol == 'ADMIN';
  }
}
