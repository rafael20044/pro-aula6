import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { IAnswersCreate } from 'src/app/interfaces/ianswerscreate';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { AnswersService } from 'src/app/shared/services/answers-service';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { QuestionService } from 'src/app/shared/services/question-service';
import { ReactionService, ReactionType, TargetType } from 'src/app/shared/services/reaction-service';
import { ToastService } from 'src/app/shared/services/toast-service';
import { StorageService } from 'src/app/shared/services/storage-service';
import { NotificationService } from 'src/app/shared/services/notification-service';
import { INotificarion } from 'src/app/interfaces/inotification';
import { UserService } from 'src/app/shared/services/user-service';

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.page.html',
  styleUrls: ['./question-details.page.scss'],
  standalone: false,
})
export class QuestionDetailsPage implements OnInit {

  id: number = 0;
  questionDetails: IQuestionDetails | null = null;
  loading = true;
  commentControl = new FormControl('');
  useId: number = 0;
  editingAnswerId: number = 0;
  modalOpen = false;
  currentAnswerId!: number;
  editControl = new FormControl("");
  private fullName: string = '';

  avatarUrl: string | null = null;
  imageUrls: string[] = [];

  constructor(
    private readonly active: ActivatedRoute,
    private readonly router: Router,
    private readonly question: QuestionService,
    private readonly toas: ToastService,
    private readonly answers: AnswersService,
    private readonly local: LocalStorageService,
    private readonly storageService: StorageService,
    private readonly reactionService: ReactionService,
    private readonly notification: NotificationService,
    private readonly user: UserService,
    private readonly answer: AnswersService,
  ) { }

  async ngOnInit() {
    const idParam = this.active.snapshot.paramMap.get('id') || '0';
    this.id = parseInt(idParam, 10);
    await this.loadData();
    this.useId = parseInt(this.local.get(Const.USER_ID) || '0');
    this.fullName = await this.user.getFullName(this.useId) || '';

    this.commentControl.valueChanges.subscribe(() => {
      this.autoResizeTextarea();
    });
  }

  private autoResizeTextarea() {
    setTimeout(() => {
      const textarea = document.querySelector('.response-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    }, 0);
  }


  async addComent() {
    const text = this.commentControl.value;
    if (!text) {
      this.toas.showError('Llene el campo');
      return;
    }
    const data: IAnswersCreate = {
      body: text,
      user_id: this.useId,
      question_id: this.questionDetails?.question_id || 0,
    }
    const id = await this.answers.createAnswer(data);
    if (!id) {
      this.toas.showError('Error al crear la respuesta');
      return;
    }
    const noti: INotificarion = {
      user_id: this.questionDetails?.user_id || 0,
      question_id: this.questionDetails?.question_id || 0,
      title: 'Un usuario ha respondido tu pregunta',
      body: `${this.fullName} ha respondido lo siguiente:" ${this.commentControl.value} "`
    }
    this.commentControl.reset();
    await this.notification.createNotification(noti);
    await this.loadData();
    this.toas.show('Respuesta publicada');
  }

  async reactionQuestion(type: ReactionType) {
    const id = this.questionDetails?.question_id || 0;
    await this.reactionService.reaction(this.useId, id, 'question_id', type);
    const noti: INotificarion = {
      user_id: this.questionDetails?.user_id || 0,
      question_id: this.questionDetails?.question_id || 0,
      title: 'Un usuario ha reaccionado a tu respuesta',
      body: `${this.fullName} dio ${type === 'LIKE' ? 'like 👍' : 'dislike 👎'}`
    }
    await this.notification.createNotification(noti);
    await this.loadData();
  }

  async reactionAnswer(answerId: number, answerUserId: number, type: ReactionType) {
    await this.reactionService.reaction(this.useId, answerId, 'answer_id', type);
    const noti: INotificarion = {
      user_id: answerUserId,
      question_id: this.questionDetails?.question_id || 0,
      title: 'Un usuario ha reaccionado a tu respuesta',
      body: `${this.fullName} dio ${type === 'LIKE' ? 'like 👍' : 'dislike 👎'} a tu respuesta`
    }
    await this.notification.createNotification(noti);
    await this.loadData();
  }



  private async loadData() {
    try {
      this.loading = true;
      const data = await this.question.getQuestionDetails(this.id);

      // Eliminar respuestas duplicadas
      if (data?.answers) {
        const uniqueAnswersMap = new Map();
        data.answers.forEach(answer => {
          if (!uniqueAnswersMap.has(answer.answer_id)) {
            uniqueAnswersMap.set(answer.answer_id, answer);
          }
        });
        data.answers = Array.from(uniqueAnswersMap.values());
      }

      this.questionDetails = data;

      if (data) {
        await this.resolveAvatarUrl();
        await this.resolveImageUrls();
      }
    } catch (error) {
      console.error('Error al obtener la pregunta:', error);
    } finally {
      this.loading = false;
    }
  }

  private async resolveAvatarUrl() {
    if (!this.questionDetails?.photo) {
      this.avatarUrl = null;
      return;
    }

    const photo = this.questionDetails.photo;

    if (typeof photo === 'string' && photo.startsWith('http')) {
      this.avatarUrl = photo;
      return;
    }

    // Otherwise, get signed URL from storage
    try {
      const signed = await this.storageService.getSignUrl(Const.BUCKET, photo);
      this.avatarUrl = signed?.url || null;
    } catch (err) {
      console.error('Error resolving avatar URL:', err);
      this.avatarUrl = null;
    }
  }

  private async resolveImageUrls() {
    if (!this.questionDetails?.images || this.questionDetails.images.length === 0) {
      this.imageUrls = [];
      return;
    }

    const resolved: string[] = [];
    for (const img of this.questionDetails.images) {
      const path = img.path || img.url;
      if (!path) continue;

      // If already a full URL, use it
      if (typeof path === 'string' && path.startsWith('http')) {
        resolved.push(path);
        continue;
      }

      // Otherwise, get signed URL from storage
      try {
        const signed = await this.storageService.getSignUrl(Const.BUCKET, path);
        if (signed?.url) {
          resolved.push(signed.url);
        }
      } catch (err) {
        console.error('Error resolving image URL:', err);
      }
    }

    this.imageUrls = resolved;
  }

  goToUserProfile() {
    const userId = this.questionDetails?.user_id;
    if (userId) {
      this.router.navigate([`/profile/${userId}`]);
    }
  }

  async deleteAnswer(id: number) {
    const { data, error } = await this.answer.deleteAnswer(id);
    if (error) {
      this.toas.showError('Error al eliminar la respuesta');
      return;
    }
    this.toas.show('Respuesta eliminada');
    await this.loadData();
  }

  openEditModal(answer: any) {
    this.currentAnswerId = answer.answer_id;
    this.editControl.setValue(answer.body);
    this.modalOpen = true;
  }

  async saveEdit() {
    const body = this.editControl.value?.trim();
    if (!body) return;

    const result = await this.answer.updateAnswer(this.currentAnswerId, body);
    if (!result) {
      this.toas.showError('Error al actualizar la respuesta');
      return;
    }
    this.toas.show('Respuesta actualizada');
    await this.loadData();
    this.modalOpen = false;
  }
}
