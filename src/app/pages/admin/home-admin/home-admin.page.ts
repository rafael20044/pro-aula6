import { Component, OnInit } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';

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
    { label: 'Usuarios',    value: '—' },
    { label: 'Activos hoy', value: '—' },
    { label: 'Reportes',    value: '—' }
  ];

  quickActions: QuickAction[] = [
    { label: 'Ver usuarios', icon: 'people',             link: '/admin/users' },
    { label: 'Reportes',     icon: 'document-text',      link: '/admin/reports' },
    { label: 'Roles',        icon: 'shield-checkmark',   link: '/admin/settings' },
  ];

  async ngOnInit() {
    await this.loadMetrics();
  }

  async refresh() {
    await this.loadMetrics();
  }

  private async loadMetrics() {
    this.loading = true;
    try {
      const [users, activeToday, reports] = await Promise.all([
        this.countUsers(),
        this.countActiveToday(),
        this.countReports()
      ]);

      this.metrics = [
        { label: 'Usuarios',    value: users },
        { label: 'Activos hoy', value: activeToday },
        { label: 'Reportes',    value: reports },
      ];
    } catch (e) {
      console.error('Error cargando métricas', e);
    } finally {
      this.loading = false;
    }
  }

  private async countUsers(): Promise<number> {
    const { count, error } = await Supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('countUsers', error.message);
      return 0;
    }
    return count ?? 0;
  }

  private async countActiveToday(): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const { count, error } = await Supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', start.toISOString());

    if (error) {
      console.error('countActiveToday', error.message);
      return 0;
    }
    return count ?? 0;
  }

  private async countReports(): Promise<number> {
    const { count, error } = await Supabase
      .from('pqrs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('countReports', error.message);
      return 0;
    }
    return count ?? 0;
  }
}
