import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Supabase } from 'src/app/core/supabase/supabase';
import { Const } from 'src/app/const/const';
import { StorageService } from 'src/app/shared/services/storage-service';
import { AuthService } from 'src/app/shared/services/auth-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit{

  showLogo = true;
  userAvatarUrl: string | null = null;
  userInitials: string = '';
  private sessionUserId: string | null = null;

  constructor(private router: Router, private readonly storageService: StorageService, private readonly auth: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  onTabChange(event: any) {
    const selectedTab = event.tab;
    this.showLogo = selectedTab === 'home';
  }

  goToCreateQuestion() {
    this.router.navigate(['/user/create-question']);
  }

  async signOut() {
    try {
      await this.auth.signOut();
      // navigate to login
      this.router.navigate(['/auth/login']);
    } catch (err) {
      console.error('Error signing out', err);
    }
  }

  private async loadUserProfile() {
    await this.auth.ensureReady();
    const user = this.auth.getUser();
    if (!user) return;
    this.sessionUserId = user.id;

    // Buscar datos del usuario en la tabla de usuarios
    const { data, error } = await Supabase
      .from(Const.TB_USER)
      .select('name, last_name, photo')
      .eq('uid', user.id)
      .single();

    if (error) {
      console.warn('No se pudo cargar perfil', error);
      return;
    }

    const raw = data?.photo || null;
    if (raw && typeof raw === 'string' && raw.startsWith('http')) {
      this.userAvatarUrl = raw;
    } else if (raw) {
      try {
        const signed = await this.storageService.getSignUrl(Const.BUCKET, raw);
        this.userAvatarUrl = signed?.url || null;
      } catch {
        this.userAvatarUrl = null;
      }
    } else {
      this.userAvatarUrl = null;
    }
    this.userInitials = this.buildInitials(data?.name, data?.last_name);
  }

  private buildInitials(name?: string, last?: string): string {
    const first = (name || '').trim().split(/\s+/)[0] || '';
    const lastPart = (last || '').trim().split(/\s+/)[0] || '';
    const initials = `${first.charAt(0)}${lastPart.charAt(0)}`.toUpperCase();
    return initials || 'U';
  }
}