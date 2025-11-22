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
    // 1) Check if already exists (case-insensitive)
    const { data: existing, error: existErr } = await (Supabase.from('tags') as any)
      .select('*')
      .ilike('name', clean)
      .limit(1);
    if (!existErr && Array.isArray(existing) && existing.length > 0) {
      return existing[0] as TagDto;
    }

    // 2) Insert if not exists
    const { data, error } = await (Supabase.from('tags') as any)
      .insert({ name: clean, updated_at: new Date().toISOString() })
      .select()
      .single();

    // 3) Handle potential race/unique errors by fetching again
    if (error) {
      console.error('create tag error', error);
      try {
        const { data: again } = await (Supabase.from('tags') as any)
          .select('*')
          .ilike('name', clean)
          .limit(1);
        if (Array.isArray(again) && again.length > 0) {
          return again[0] as TagDto;
        }
      } catch {}
      return null;
    }
    return data as TagDto;
  }
}
