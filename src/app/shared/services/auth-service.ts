import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { ToastService } from './toast-service';
import { Const } from 'src/app/const/const';
import { UserService } from './user-service';
import type { Session, User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private session: Session | null = null;
  private user: User | null = null;
  private internalUserId: number | null = null;
  private initializing = false;

  constructor(private readonly toat:ToastService, private readonly userService: UserService) { }

  // Inicializa y cachea sesión y usuario interno para evitar locks
  async init() {
    if (this.initializing) return;
    this.initializing = true;
    try {
      const { data } = await Supabase.auth.getSession();
      this.session = data.session ?? null;
      this.user = this.session?.user ?? null;
      if (this.user?.id) {
        const found = await this.userService.findIdByUid(this.user.id);
        this.internalUserId = found ?? null;
      }
      Supabase.auth.onAuthStateChange(async (_evt, session) => {
        this.session = session ?? null;
        this.user = session?.user ?? null;
        if (this.user?.id) {
          const found = await this.userService.findIdByUid(this.user.id);
          this.internalUserId = found ?? null;
        } else {
          this.internalUserId = null;
        }
      });
    } finally {
      this.initializing = false;
    }
  }

  async ensureReady(): Promise<void> {
    if (!this.user && !this.initializing) {
      await this.init();
    } else if (this.initializing) {
      while (this.initializing) {
        await new Promise(r => setTimeout(r, 40));
      }
    }
  }

  getUser(): User | null { return this.user; }
  getSession(): Session | null { return this.session; }
  getInternalUserId(): number | null { return this.internalUserId; }

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
    this.session = null;
    this.user = null;
    this.internalUserId = null;
  }

  async isAdmin(uid:string){
    const {data, error} = await Supabase.from(Const.TB_USER).select('rol').eq('uid', uid).single();
    if (error) {
      return false;
    }
    return data.rol == 'ADMIN';
  }
}
