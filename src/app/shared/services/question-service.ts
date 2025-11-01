import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  
  constructor(){}

  async findAllQuestions(){
    const {data, error} = await Supabase.rpc('get_all_questions');
    if (error) {
      console.log(error);
      return [];
    }
    return data as IQuestionHome[];
  }
}
