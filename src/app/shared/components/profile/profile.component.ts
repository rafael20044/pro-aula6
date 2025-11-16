import { Component, OnInit } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { Const } from 'src/app/const/const';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false,
})
export class ProfileComponent  implements OnInit {
  avatarUrl: string | null = null;
  initials: string = '';
  fullName: string = '';
  email: string = '';
  username: string = '';
  joinedDate: string = '';
  location?: string; // opcional por ahora
  birthdate?: string; // opcional por ahora

  constructor() { }

  async ngOnInit() {
    const { data: { user } } = await Supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await Supabase
      .from(Const.TB_USER)
      .select('name, last_name, email, photo, created_at')
      .eq('uid', user.id)
      .single();
    if (error) return;
    this.avatarUrl = data?.photo || null;
    const name = (data?.name || '').trim();
    const last = (data?.last_name || '').trim();
    this.fullName = [name, last].filter(Boolean).join(' ');
    this.initials = this.buildInitials(name, last);
    this.email = data?.email || '';
    this.username = this.buildUsername(this.email);
    this.joinedDate = this.formatJoinedDate(data?.created_at);
  }

  private buildInitials(name?: string, last?: string) {
    const f = (name || '').split(/\s+/)[0] || '';
    const l = (last || '').split(/\s+/)[0] || '';
    const letters = `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
    return letters || 'U';
  }

  private buildUsername(email: string): string {
    if (!email) return '';
    const handle = email.split('@')[0].replace(/[^a-zA-Z0-9_\.\-]/g, '');
    return `@${handle}`;
  }

  private formatJoinedDate(iso?: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
      const text = formatter.format(d);
      return `Se unió en ${text}`;
    } catch {
      return '';
    }
  }

}
