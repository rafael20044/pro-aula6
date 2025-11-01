import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(){}

  async createUser(user: any) {
    const { data, error } = await Supabase.from(Const.TB_USER).insert(user);

    if (error) {
      // this.toast.show('Error al guardar los datos', 1500, 'bottom', 'warning');
      return false;
    }

    return true;
  }

  async countAllUser() {
    const { data, error } = await Supabase.from(Const.TB_USER).select('id');
    if (error) {
      console.log(error);
      return 0;
    }
    return data.length;
  }
}
