import { Component, OnInit } from '@angular/core';
import { TagService, TagDto } from 'src/app/shared/services/tag-service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.page.html',
  styleUrls: ['./tags.page.scss'],
  standalone: false
})
export class TagsPage implements OnInit {
  tags: TagDto[] = [];
  loading = true;

  constructor(
    private tagService: TagService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadTags();
  }

  async loadTags() {
    this.loading = true;
    this.tags = await this.tagService.getAll();
    this.loading = false;
  }

  async createTag() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Etiqueta',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la etiqueta'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: async (data) => {
            if (!data.name) return;
            const newTag = await this.tagService.create(data.name);
            if (newTag) {
              this.showToast('Etiqueta creada correctamente', 'success');
              this.loadTags();
            } else {
              this.showToast('Error al crear la etiqueta', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteTag(tag: TagDto) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Etiqueta',
      message: `¿Estás seguro de que deseas eliminar la etiqueta "${tag.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            if (!tag.id) return;
            const result = await this.tagService.delete(tag.id);
            if (result.success) {
              this.showToast('Etiqueta eliminada', 'success');
              this.loadTags();
            } else {
              if (result.error?.code === '23503') {
                this.showToast('No se puede eliminar: Esta etiqueta está siendo usada en preguntas o usuarios.', 'warning');
              } else {
                this.showToast('Error al eliminar la etiqueta', 'danger');
              }
            }
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
