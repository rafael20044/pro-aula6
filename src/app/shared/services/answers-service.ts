import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {
  
  constructor(){}

  async createAnswer(data2:any){
    const {data, error} = await Supabase.from(Const.TB_ANSWERS).insert(data2).select('id').single();
    if (error) {
      console.log(error);
      return null;
    }
    return data.id;
  }
}
