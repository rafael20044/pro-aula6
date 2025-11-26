import { Component, OnInit } from '@angular/core';
import { TicketService } from 'src/app/shared/services/ticket-service';
import { ITicketFind } from 'src/app/interfaces/iticket';
import { AlertController, ToastController } from '@ionic/angular';
import { Supabase } from 'src/app/core/supabase/supabase';
import { Const } from 'src/app/const/const';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: false
})
export class ReportsPage implements OnInit {
  tickets: ITicketFind[] = [];
  loading = true;

  constructor(
    private ticketService: TicketService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadTickets();
  }

  async loadTickets() {
    this.loading = true;
    try {
      this.tickets = await this.ticketService.findAllTickets();
    } catch (error) {
      console.error('Error loading tickets:', error);
      this.showToast('Error cargando tickets', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async resolveTicket(ticket: ITicketFind) {
    const alert = await this.alertCtrl.create({
      header: 'Resolver Ticket',
      message: '¿Marcar este ticket como resuelto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, resolver',
          handler: async () => {
            // Assuming we just update the status to true (closed)
            const { error } = await Supabase
              .from(Const.TB_TICKETS)
              .update({ status: true })
              .eq('id', ticket.id);

            if (error) {
              this.showToast('Error al resolver el ticket', 'danger');
            } else {
              this.showToast('Ticket resuelto', 'success');
              this.loadTickets(); // Reload list
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
