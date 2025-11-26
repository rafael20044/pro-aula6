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

      const newType: ReactionType = data.tipo === 'LIKE' ? 'DISLIKE' : 'LIKE';
      await this.update(data.id, newType);
      return newType;

    } catch (err) {
      console.error('Error en reaction():', err);
      return null;
    }
  }

  private async create(target: string, userId: number, targetId: number, reaction: ReactionType) {
    try {
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
        // Manejar error específico de NOT NULL violation
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
}

export type TargetType = 'question_id' | 'answer_id';
export type ReactionType = 'LIKE' | 'DISLIKE';
