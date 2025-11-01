import { Injectable } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';

export interface TagDto { id?: number; name: string; }

@Injectable({ providedIn: 'root' })
export class TagService {
  async getAll(): Promise<TagDto[]> {
    const { data, error } = await (Supabase.from('tags') as any).select('*').order('name');
    if (error) { console.error('getAll tags error', error); return []; }
    return (data || []) as TagDto[];
  }

  async search(q: string): Promise<TagDto[]> {
    const query = q.trim();
    if (!query) return this.getAll();
    const { data, error } = await (Supabase.from('tags') as any)
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');
    if (error) { console.error('search tags error', error); return []; }
    return (data || []) as TagDto[];
  }

  async create(name: string): Promise<TagDto | null> {
    const clean = name.trim();
    if (!clean) return null;
    const { data, error } = await (Supabase.from('tags') as any)
      .insert({ name: clean })
      .select()
      .single();
    if (error) { console.error('create tag error', error); return null; }
    return data as TagDto;
  }
}
