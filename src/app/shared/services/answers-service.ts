import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {
  
  constructor(){}

  async createAnswer(data:any){
    const {error} = await Supabase.from(Const.TB_ANSWERS).insert(data);
    if (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}
