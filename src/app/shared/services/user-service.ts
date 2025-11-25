import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';
import { IUserProfile } from 'src/app/interfaces/iuserprofile';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(){}

  async createUser(user: any) {
    const { data, error } = await Supabase.from(Const.TB_USER).insert(user);

    if (error) {
      // this.toast.show('Error al guardar los datos', 1500, 'bottom', 'warning');
      //console.log(error);
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

  async findIdByUid(uid:string){
    const {data, error} = await Supabase.from(Const.TB_USER).select('id').eq('uid', uid).single();
    if (error) {
      console.log(error);
      return null;
    }
    return data.id as number;
  }

  async getUser(id:number){
    const {data, error} = 
      await Supabase.from(Const.TB_USER).select('id, name, last_name, email, photo, created_at').
      eq('id', id).single();

    if (error) {
      console.log(error);
      return;
    }
    return data as IUserProfile;
  }

  async removeUser(uid:string){
    const {error} = await Supabase.auth.admin.deleteUser(uid);
    if (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}
