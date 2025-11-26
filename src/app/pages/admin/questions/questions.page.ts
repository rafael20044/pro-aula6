import { Component, OnInit } from '@angular/core';
import { QuestionService } from 'src/app/shared/services/question-service';
import { AlertController, ToastController } from '@ionic/angular';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.page.html',
  styleUrls: ['./questions.page.scss'],
  standalone: false
})
export class QuestionsPage implements OnInit {
  questions: IQuestionHome[] = [];
  loading = true;

  constructor(
    private questionService: QuestionService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadQuestions();
  }

  async loadQuestions() {
    this.loading = true;
    try {
      this.questions = await this.questionService.findAllQuestions();
    } catch (error) {
      console.error('Error loading questions:', error);
      this.showToast('Error cargando preguntas', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async deleteQuestion(question: IQuestionHome) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Pregunta',
      message: `¿Estás seguro de que deseas eliminar la pregunta "${question.title}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const success = await this.questionService.deleteQuestion(question.question_id);
            if (success) {
              this.showToast('Pregunta eliminada correctamente', 'success');
              this.loadQuestions();
            } else {
              this.showToast('Error al eliminar la pregunta', 'danger');
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
