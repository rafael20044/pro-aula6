import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/shared/services/admin-service';
import { AuthService } from 'src/app/shared/services/auth-service';
import { Router } from '@angular/router';

type Metric = { label: string; value: number | string };
type QuickAction = { label: string; icon: string; link: string };

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.page.html',
  styleUrls: ['./home-admin.page.scss'],
  standalone: false
})
export class HomeAdminPage implements OnInit {

  loading = false;

  metrics: Metric[] = [
    { label: 'Usuarios', value: '—' },
    { label: 'Activos hoy', value: '—' },
    { label: 'Tickets', value: '—' }
  ];

  quickActions: QuickAction[] = [
    { label: 'Ver usuarios', icon: 'people', link: '/admin/users' },
    { label: 'Tickets', icon: 'document-text', link: '/admin/reports' },
    { label: 'Etiquetas', icon: 'pricetags', link: '/admin/tags' },
    { label: 'Preguntas', icon: 'chatbubbles', link: '/admin/questions' },
    { label: 'Respuestas', icon: 'chatbox-ellipses', link: '/admin/answers' },
  ];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadMetrics();
  }

  ionViewWillEnter() {
    this.loadMetrics();
  }

  async refresh() {
    await this.loadMetrics();
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  private async loadMetrics() {
    this.loading = true;
    try {
      const stats = await this.adminService.getDashboardStats();

      this.metrics = [
        { label: 'Usuarios', value: stats.users },
        { label: 'Activos hoy', value: stats.activeToday },
        { label: 'Tickets', value: stats.reports },
      ];
    } catch (e) {
      console.error('Error cargando métricas', e);
    } finally {
      this.loading = false;
    }
  }
}
