import { Injectable } from '@angular/core';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';

@Injectable({
  providedIn: 'root'
})
export class ReactionService {

  constructor() {}

async reaction(userId: number, targetId: number, target: TargetType, reaction: ReactionType) {
  try {
    const { data, error } = await Supabase
      .from(Const.TB_REACTIONS)
      .select('id, tipo')
      .eq('user_id', userId)
      .eq(target, targetId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      await this.create(target, userId, targetId, reaction);
      return reaction;
    }

    if (data.tipo === reaction) {
      await this.remove(data.id);
      return null;
    }

    await this.update(data.id, reaction);
    return reaction;

  } catch (err) {
    console.error('Error en reaction():', err);
    return null;
  }
}


  private async create(target: string, userId: number, targetId: number, reaction: ReactionType) {
    try {
      // Insert explícito de ambos campos para evitar NOT NULL conflict si el otro es obligatorio
      const insertData = {
        user_id: userId,
        question_id: target === 'question_id' ? targetId : null,
        answer_id: target === 'answer_id' ? targetId : null,
        tipo: reaction
      };

      const { data, error } = await Supabase
        .from(Const.TB_REACTIONS)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        // Detalle específico para NOT NULL constraint en answer_id
        if ((error as any).code === '23502') {
          console.error('La columna answer_id tiene NOT NULL y estás insertando reacción sobre una pregunta. Debes permitir NULL o separar tablas.');
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Error en create():', err);
      return null;
    }
  }

  private async update(id: number, tipo: ReactionType) {
    try {
      const { error } = await Supabase
        .from(Const.TB_REACTIONS)
        .update({ tipo })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error en update():', err);
    }
  }

  private async remove(id: number) {
  try {
    const { error } = await Supabase
      .from(Const.TB_REACTIONS)
      .update({tipo: ''})
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Error en remove():', err);
  }
}

}

export type TargetType = 'question_id' | 'answer_id';
export type ReactionType = 'LIKE' | 'DISLIKE';
