import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/shared/services/admin-service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: false
})
export class UsersPage implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  loading = true;

  constructor(
    private adminService: AdminService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      this.users = await this.adminService.getUsers();
      this.filteredUsers = [...this.users];
    } catch (error) {
      console.error('Error loading users:', error);
      this.showToast('Error cargando usuarios', 'danger');
    } finally {
      this.loading = false;
    }
  }

  filterUsers(event: any) {
    const query = event.target.value.toLowerCase();
    this.searchTerm = query;

    if (!query) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter(user => {
      const name = (user.full_name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }

  async toggleBan(user: any) {
    const action = user.is_banned ? 'Desbanear' : 'Banear';
    const alert = await this.alertCtrl.create({
      header: `Confirmar ${action}`,
      message: `¿Estás seguro de que deseas ${action.toLowerCase()} a ${user.full_name || user.email}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, confirmar',
          handler: async () => {
            const { error } = await this.adminService.toggleUserBan(user.id, user.is_banned);
            if (error) {
              this.showToast('Error al actualizar el estado del usuario', 'danger');
            } else {
              user.is_banned = !user.is_banned;
              this.showToast(`Usuario ${user.is_banned ? 'baneado' : 'desbaneado'} correctamente`, 'success');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editUser(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Usuario',
      inputs: [
        {
          name: 'full_name',
          type: 'text',
          placeholder: 'Nombre completo',
          value: user.full_name
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.full_name) {
              this.showToast('El nombre no puede estar vacío', 'warning');
              return false;
            }

            const { error } = await this.adminService.updateUser(user.id, { full_name: data.full_name });

            if (error) {
              this.showToast('Error al actualizar el usuario', 'danger');
            } else {
              user.full_name = data.full_name;
              this.showToast('Usuario actualizado correctamente', 'success');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(msg: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
