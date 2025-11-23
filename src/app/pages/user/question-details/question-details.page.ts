import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Const } from 'src/app/const/const';
import { IAnswersCreate } from 'src/app/interfaces/ianswerscreate';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { AnswersService } from 'src/app/shared/services/answers-service';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { QuestionService } from 'src/app/shared/services/question-service';
import { ToastService } from 'src/app/shared/services/toast-service';
import { StorageService } from 'src/app/shared/services/storage-service';
import { AuthService } from 'src/app/shared/services/auth-service';

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
  
  // Resolved URLs
  avatarUrl: string | null = null;
  imageUrls: string[] = [];

  constructor(
    private readonly active: ActivatedRoute,
    private readonly question: QuestionService,
    private readonly toas:ToastService,
    private readonly answers:AnswersService,
    private readonly local:LocalStorageService,
    private readonly storageService: StorageService,
    private readonly auth: AuthService
  ) { }

  async ngOnInit() {
    const idParam = this.active.snapshot.paramMap.get('id') || '0';
    this.id = parseInt(idParam, 10);
    await this.loadData();
    this.useId = parseInt(this.local.get(Const.USER_ID) || '0');
  }


  async addComent(){
    const text = this.commentControl.value;
    if (!text) {
      this.toas.showError('Llene el campo');
      return;
    }
    const data:IAnswersCreate = {
      body: text,
      user_id: this.useId,
      question_id: this.questionDetails?.question_id || 0,
    }
    const id = await this.answers.createAnswer(data);
    if (!id) {
      this.toas.showError('Error al crear la respuesta');
      return;
    }
    this.toas.show('Respuesta publicada');
  }

  private async loadData() {
    try {
      this.loading = true;
      const data = await this.question.getQuestionDetails(this.id);
      this.questionDetails = data;
      
      // Resolve avatar and images URLs
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
}
