import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  
  constructor(
    private readonly toast:ToastService
  ){}

  async createUser(user:any){
    const {data, error} = await Supabase.from('users').insert(user);

    if (error) {
      // this.toast.show('Error al guardar los datos', 1500, 'bottom', 'warning');
      return false;
    }
    
    return true;
  }
}
