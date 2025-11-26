import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/shared/services/admin-service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.page.html',
    styleUrls: ['./answers.page.scss'],
    standalone: false
})
export class AnswersPage implements OnInit {
    answers: any[] = [];
    loading = true;

    constructor(
        private adminService: AdminService,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController
    ) { }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.loadAnswers();
    }

    async loadAnswers() {
        this.loading = true;
        try {
            this.answers = await this.adminService.getAnswers();
        } catch (error) {
            console.error('Error loading answers:', error);
            this.showToast('Error cargando respuestas', 'danger');
        } finally {
            this.loading = false;
        }
    }

    async deleteAnswer(answer: any) {
        const alert = await this.alertCtrl.create({
            header: 'Confirmar eliminación',
            message: '¿Estás seguro de que deseas eliminar esta respuesta? Esta acción no se puede deshacer.',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: async () => {
                        const { error } = await this.adminService.deleteAnswer(answer.id);
                        if (error) {
                            this.showToast('Error al eliminar la respuesta', 'danger');
                        } else {
                            this.answers = this.answers.filter(a => a.id !== answer.id);
                            this.showToast('Respuesta eliminada correctamente', 'success');
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
