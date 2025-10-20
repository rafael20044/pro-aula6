import { Component } from '@angular/core';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.page.html',
  styleUrls: ['./home-admin.page.scss'],
  standalone: false
})
export class HomeAdminPage {
  // MOCK de métricas
  metrics = [
    { label: 'Usuarios', value: 128 },
    { label: 'Activos hoy', value: 23 },
    { label: 'Reportes', value: 4 }
  ];

  quickActions = [
    { label: 'Ver usuarios', icon: 'people', link: '/admin/users' },
    { label: 'Reportes', icon: 'document-text', link: '/admin/reports' },
    { label: 'Roles', icon: 'shield-checkmark', link: '/admin/settings' },
  ];
}
