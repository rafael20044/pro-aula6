import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';
import { ReactionService, ReactionType, TargetType } from 'src/app/shared/services/reaction-service';
import { UserService } from 'src/app/shared/services/user-service';
import { PhotoService } from 'src/app/shared/services/photo-service';
import { QuestionService } from 'src/app/shared/services/question-service';
import { Const } from 'src/app/const/const';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage-service';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { ToastService } from '../../services/toast-service';
import { FormControl, FormGroup } from '@angular/forms';
import { TicketService } from '../../services/ticket-service';
import { ITicketCreate } from 'src/app/interfaces/iticket';

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.scss'],
  standalone: false,
})
export class QuestionCardComponent implements OnInit {
  @Input() question!: IQuestionHome;
  @Input() handle?: string; // username before @ from author's email
  @Input() isOwnProfile: boolean = false; 
  @Output() emiter = new EventEmitter<boolean>();

  likeCount = 0;
  dislikeCount = 0;
  userReaction: 'LIKE' | 'DISLIKE' | null = null;
  sending = false;
  avatarUrl: string | null = null;
  imageUrls: string[] = [];
  userID = 0;

  // Modal control properties
  showQuestionReportModal = false;
  showUserReportModal = false;
  showDetailsModal = false;
  selectedReason = '';
  reportDetails = '';
  currentReportType: 'question' | 'user' = 'question';

  // form
  textAreaControl = new FormControl();
  radioControl = new FormControl();
  targetId = new FormControl();
  targettype = new FormControl();
  form = new FormGroup({
    textAreaControl: this.textAreaControl,
    radioControl: this.radioControl,
    targetId: this.targetId,
    targettype: this.targettype,
  });

  constructor(
    private readonly reactionService: ReactionService,
    private readonly userService: UserService,
    private readonly questionService: QuestionService,
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly photoService: PhotoService,
    private readonly local: LocalStorageService,
    private readonly reactionS: ReactionService,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly alertCtrl: AlertController,
    private readonly toast: ToastService,
    private readonly ticket:TicketService,
  ) { }

  ngOnInit() {
    this.likeCount = this.getLikeCount();
    this.dislikeCount = this.getDislikeCount();
    this.resolveAvatar();
    this.resolveImages();
    this.userID = parseInt(this.local.get(Const.USER_ID) || '0');
  }

  trackTag(index: number, tag: string) { return tag + index; }

  getAvatarSrc(): string | null {
    const q: any = this.question as any;
    return q?.photo ?? q?.photo_url ?? q?.avatar_url ?? q?.user_photo ?? null;
  }

  private async resolveAvatar() {
    const raw = this.getAvatarSrc();
    this.avatarUrl = await this.photoService.resolvePhotoUrl(raw);
  }

  getImagesList(): Array<any> {
    const q: any = this.question as any;
    if (Array.isArray(q?.images) && q.images.length) return q.images;
    if (Array.isArray(q?.images_urls) && q.images_urls.length) return q.images_urls;
    return [];
  }

  private async resolveImages() {
    try {
      const items = this.getImagesList();
      const rawPhotos: (string | null)[] = [];

      for (const it of items) {
        if (!it) continue;
        if (typeof it === 'string') {
          rawPhotos.push(it);
        } else if (typeof it === 'object') {
          const candidate = (it.url || it.image_url || it.path || it.image) as string | undefined;
          rawPhotos.push(candidate || null);
        }
      }

      const resolved = await this.photoService.resolveMultiplePhotos(rawPhotos);
      this.imageUrls = resolved.filter((url): url is string => url !== null);
    } catch (err) {
      console.warn('Could not resolve images', err);
      this.imageUrls = [];
    }
  }

  getAnswerCount(): number {
    return this.question.comment_count;
  }

  getLikeCount(): number {
    return (this.question as any).like_count ?? 0;
  }

  getDislikeCount(): number {
    return (this.question as any).dislike_count ?? 0;
  }

  async onLike() {
    try {
      if (this.sending) return; // prevent double click spam
      this.sending = true;
      await this.auth.ensureReady();
      const user = this.auth.getUser();
      if (!user?.id) {
        console.warn('User not logged in');
        this.sending = false;
        return;
      }

      let userId = this.auth.getInternalUserId();
      if (!userId) {
        const found = await this.userService.findIdByUid(user.id);
        userId = found ?? null;
      }
      if (!userId) {
        console.warn('Could not find user ID');
        return;
      }

      const questionId = (this.question as any).question_id;
      const previous = this.userReaction;
      const result = await this.reactionService.reaction(userId, questionId, 'question_id', 'LIKE');
      if (result) {
        if (previous === 'LIKE') {
          this.likeCount = Math.max(0, this.likeCount - 1);
          this.dislikeCount += 1;
          this.userReaction = 'DISLIKE';
        } else if (previous === 'DISLIKE') {
          this.dislikeCount = Math.max(0, this.dislikeCount - 1);
          this.likeCount += 1;
          this.userReaction = 'LIKE';
        } else {
          if (result === 'LIKE') {
            this.likeCount += 1;
            this.userReaction = 'LIKE';
          } else if (result === 'DISLIKE') {
            this.dislikeCount += 1;
            this.userReaction = 'DISLIKE';
          }
        }
      }
      this.emiter.emit(true);
    } catch (err) {
      console.error('Error in onLike:', err);
    } finally {
      this.sending = false;
    }
  }

  async onDislike() {
    try {
      if (this.sending) return;
      this.sending = true;
      await this.auth.ensureReady();
      const user = this.auth.getUser();
      if (!user?.id) {
        console.warn('User not logged in');
        this.sending = false;
        return;
      }

      let userId = this.auth.getInternalUserId();
      if (!userId) {
        const found = await this.userService.findIdByUid(user.id);
        userId = found ?? null;
      }
      if (!userId) {
        console.warn('Could not find user ID');
        return;
      }

      const questionId = (this.question as any).question_id;
      const previous = this.userReaction;
      const result = await this.reactionService.reaction(userId, questionId, 'question_id', 'DISLIKE');
      if (result) {
        if (previous === 'DISLIKE') {

          this.dislikeCount = Math.max(0, this.dislikeCount - 1);
          this.likeCount += 1;
          this.userReaction = 'LIKE';
        } else if (previous === 'LIKE') {
          this.likeCount = Math.max(0, this.likeCount - 1);
          this.dislikeCount += 1;
          this.userReaction = 'DISLIKE';
        } else {
          if (result === 'LIKE') {
            this.likeCount += 1;
            this.userReaction = 'LIKE';
          } else if (result === 'DISLIKE') {
            this.dislikeCount += 1;
            this.userReaction = 'DISLIKE';
          }
        }
      }
      this.emiter.emit(true);
    } catch (err) {
      console.error('Error in onDislike:', err);
    } finally {
      this.sending = false;
    }
  }

  async reaction(target: TargetType, type: ReactionType) {
    if (target === 'question_id') {
      const id = this.question?.question_id || 0;
      await this.reactionService.reaction(this.userID, id, target, type);
      this.emiter.emit(true);
      return;
    }
  }

  onComment() {
    this.router.navigate([`question-details/${this.question.question_id}`]);
  }

  goToDetaiss() {
    this.router.navigate([`/question-details/${this.question.question_id}`]);
  }

  async openMenu(event: Event) {
    event.stopPropagation();

    const buttons = this.isOwnProfile ? [
      {
        text: 'Editar pregunta',
        icon: 'create-outline',
        handler: () => {
          this.editQuestion();
        }
      },
      {
        text: 'Eliminar pregunta',
        icon: 'trash-outline',
        role: 'destructive',
        handler: () => {
          this.confirmDeleteQuestion();
        }
      },
      {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel'
      }
    ] : [
      {
        text: 'Reportar pregunta',
        icon: 'flag-outline',
        handler: () => {
          this.reportQuestion();
        }
      },
      {
        text: 'Reportar usuario',
        icon: 'person-remove-outline',
        handler: () => {
          this.reportUser();
        }
      },
      {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel'
      }
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons
    });

    await actionSheet.present();
  }

  editQuestion() {
    // TODO: Navigate to edit question page
    this.toast.show('Función de edición en desarrollo', 2000, 'bottom', 'warning');
  }

  async confirmDeleteQuestion() {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar pregunta?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.deleteQuestion();
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteQuestion() {
    try {
      const success = await this.questionService.deleteQuestion(this.question.question_id);
      if (success) {
        await this.toast.show('Pregunta eliminada', 2000, 'bottom', 'success');
        this.emiter.emit(true); // Reload questions
      } else {
        await this.toast.showError('Error al eliminar la pregunta');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      await this.toast.showError('Error al eliminar la pregunta');
    }
  }

  async reportQuestion() {
    this.selectedReason = '';
    this.currentReportType = 'question';
    this.showQuestionReportModal = true;
  }

  closeQuestionReportModal() {
    this.showQuestionReportModal = false;
    this.selectedReason = '';
  }

  proceedToQuestionDetails() {
    if (!this.selectedReason) {
      this.toast.show('Debes seleccionar una razón', 2000, 'bottom', 'warning');
      return;
    }
    this.showQuestionReportModal = false;
    this.reportDetails = '';
    this.showDetailsModal = true;
  }

  async reportUser() {
    this.selectedReason = '';
    this.currentReportType = 'user';
    this.showUserReportModal = true;
  }

  closeUserReportModal() {
    this.showUserReportModal = false;
    this.selectedReason = '';
  }

  getValue(value:string, target: 'question' | 'user', targetId:number){
    this.radioControl.setValue(value);
    this.targetId.setValue(targetId);
    this.targettype.setValue((target === 'user') ? 'user_id' : 'question_id');
  }

  async submit(){
    const ticket:ITicketCreate ={
      user_id: this.userID,
      title: this.form.value.radioControl,
      body: this.form.value.textAreaControl,
      question_id: (this.targettype.value === 'question_id') ? this.targetId.value : undefined,
      user_report_id: (this.targettype.value === 'user_id') ? this.targetId.value : undefined,
    };
    const create = await this.ticket.createTicket(ticket);
    if (!create) {
      this.toast.showError('Error al enviar el reporte');
      return;
    }
    this.toast.show('Reporte enviado exitosamente');
    this.form.reset();
    this.closeDetailsModal();
  }

  proceedToUserDetails() {
    if (!this.selectedReason) {
      this.toast.show('Debes seleccionar una razón', 2000, 'bottom', 'warning');
      return;
    }
    this.showUserReportModal = false;
    this.reportDetails = '';
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.reportDetails = '';
  }

  async submitReportFromModal() {
    const details = this.reportDetails.trim();
    if (details.length < 70) {
      this.toast.show(
        `Descripción muy corta. Necesitas al menos ${70 - details.length} caracteres más`,
        3000,
        'bottom',
        'warning'
      );
      return;
    }
    
    this.closeDetailsModal();
    await this.submitReport(this.currentReportType, this.selectedReason, details);
  }

  private async submitReport(type: 'question' | 'user', reason: string, details: string) {
    // TODO: Implement backend report submission
    console.log('Report submitted:', { type, reason, details, questionId: this.question.question_id, userId: this.question.user_id });
    
    await this.toast.show(
      type === 'question' ? 'Pregunta reportada exitosamente' : 'Usuario reportado exitosamente',
      2500,
      'bottom',
      'success'
    );
  }
}
