import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';

import { ContentModerationService } from 'src/app/core/services/content-moderation.service';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {

  constructor(
    private readonly moderationService: ContentModerationService,
    private readonly toastService: ToastService
  ) { }

  async createAnswer(data2: any) {
    // Validate content with AI
    const textToValidate = data2.body || data2.answer_text;
    if (textToValidate) {
      this.toastService.show('Verificando contenido con IA...', 2000, 'top', 'success');
      const validation = await this.moderationService.validateContent(textToValidate);
      if (validation.error) {
        this.toastService.show('Advertencia: No se pudo verificar la respuesta con IA', 3000, 'top', 'warning');
      } else if (!validation.valid) {
        this.toastService.show(`Contenido inapropiado: ${validation.reason}`, 4000, 'top', 'danger');
        throw new Error(`La respuesta contiene contenido inapropiado: ${validation.reason}`);
      }
    }

    const { data, error } = await Supabase.from(Const.TB_ANSWERS).insert(data2).select('id').single();
    if (error) {
      console.log(error);
      return null;
    }
    return data.id;
  }

  async deleteAnswer(answerId: number) {
    const { data, error } = await Supabase
      .from(Const.TB_ANSWERS)
      .update({ status: 'DELETE' })
      .eq('id', answerId);

    return { data, error };
  }

  async updateAnswer(answerId: number, body: string){
    const {error} = await Supabase.from(Const.TB_ANSWERS).update({body: body}).eq('id', answerId);
    if (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}
