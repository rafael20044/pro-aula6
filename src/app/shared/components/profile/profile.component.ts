import { Component, OnInit } from '@angular/core';
import { Supabase } from 'src/app/core/supabase/supabase';
import { Const } from 'src/app/const/const';
import { AuthService } from 'src/app/shared/services/auth-service';
import { PhotoService } from 'src/app/shared/services/photo-service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false,
})
export class ProfileComponent  implements OnInit {
  avatarUrl: string | null = null;
  initials: string = '';
  fullName: string = '';
  email: string = '';
  username: string = '';
  joinedDate: string = '';
  location?: string; // opcional por ahora
  birthdate?: string; // opcional por ahora
  
  // User questions
  userQuestions: Array<{ q: IQuestionHome, handle?: string }> = [];
  loadingQuestions: boolean = true;
  currentUserId: number | null = null;

  constructor(
    private readonly photoService: PhotoService,
    private readonly auth: AuthService,
    private readonly alertCtrl: AlertController,
    private readonly router: Router
  ) { }

  async ngOnInit() {

    await this.auth.ensureReady();
    const user = this.auth.getUser();
    if (!user) return;
    const { data, error } = await Supabase
      .from(Const.TB_USER)
      .select('id, name, last_name, email, photo, created_at')
      .eq('uid', user.id)
      .single();
    if (error) return;
    
    this.currentUserId = data?.id || null;
    
    // Resolve photo using PhotoService
    this.avatarUrl = await this.photoService.resolvePhotoUrl(data?.photo);
    const name = (data?.name || '').trim();
    const last = (data?.last_name || '').trim();
    this.fullName = [name, last].filter(Boolean).join(' ');
    this.initials = this.buildInitials(name, last);
    this.email = data?.email || '';
    this.username = this.buildUsername(this.email);
    this.joinedDate = this.formatJoinedDate(data?.created_at);
    
    await this.loadUserQuestions();
  }

  trackQuestion(index: number, item: { q: IQuestionHome, handle?: string }) {
    return item.q.question_id;
  }

  async confirmSignOut() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar la sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, cerrar',
          handler: () => {
            this.performSignOut();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async performSignOut() {
    try {
      await this.auth.signOut();
      await this.router.navigate(['/auth/login']);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }

  private buildInitials(name?: string, last?: string) {
    const f = (name || '').split(/\s+/)[0] || '';
    const l = (last || '').split(/\s+/)[0] || '';
    const letters = `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
    return letters || 'U';
  }

  private buildUsername(email: string): string {
    if (!email) return '';
    const handle = email.split('@')[0].replace(/[^a-zA-Z0-9_\.\-]/g, '');
    return `@${handle}`;
  }

  private formatJoinedDate(iso?: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
      const text = formatter.format(d);
      return `Se unió en ${text}`;
    } catch {
      return '';
    }
  }

  private async loadUserQuestions() {
    this.loadingQuestions = true;
    try {
      if (!this.currentUserId) {
        this.userQuestions = [];
        return;
      }

      console.log('Loading questions for user_id:', this.currentUserId);

      // First, try to get questions with all related data
      const { data: questionsData, error: questionsError } = await Supabase
        .from(Const.TB_QUESTIONS)
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('created_at', { ascending: false });
      if (questionsError) {
        console.error('Error loading user questions:', questionsError);
        this.userQuestions = [];
        return;
      }

      if (!questionsData || questionsData.length === 0) {
        this.userQuestions = [];
        return;
      }

      // Get images for these questions
      const questionIds = questionsData.map(q => q.id);
      const { data: imagesData } = await Supabase
        .from(Const.TB_IMAGES)
        .select('question_id, image_url, path')
        .in('question_id', questionIds);

      // Get tags for these questions
      const { data: tagsData } = await Supabase
        .from(Const.TB_TAGS_QUESTIONS)
        .select('question_id, tags(name)')
        .in('question_id', questionIds);

      // Get reactions for these questions
      const { data: reactionsData } = await Supabase
        .from(Const.TB_REACTIONS)
        .select('question_id, type')
        .in('question_id', questionIds)
        .is('answer_id', null);

      console.log('Additional data:', { 
        images: imagesData?.length, 
        tags: tagsData?.length, 
        reactions: reactionsData?.length 
      });

      // Transform data to IQuestionHome format
      const questions: IQuestionHome[] = questionsData.map((q: any) => {
        // Get images for this question
        const questionImages = (imagesData || [])
          .filter((img: any) => img.question_id === q.id)
          .map((img: any) => ({
            image_url: img.image_url,
            path: img.path
          }));

        // Get tags for this question
        const questionTags = (tagsData || [])
          .filter((tq: any) => tq.question_id === q.id)
          .map((tq: any) => tq.tags?.name)
          .filter(Boolean);

        // Count reactions for this question
        const questionReactions = (reactionsData || [])
          .filter((r: any) => r.question_id === q.id);
        const likeCount = questionReactions.filter((r: any) => r.type === 'like').length;
        const dislikeCount = questionReactions.filter((r: any) => r.type === 'dislike').length;

        return {
          question_id: q.id,
          user_id: q.user_id,
          full_name: this.fullName,
          photo: this.avatarUrl,
          title: q.title,
          body: q.body,
          images: questionImages,
          tags: questionTags,
          comment_count: 0,
          status: q.status || 'active',
          like_count: likeCount,
          dislike_count: dislikeCount
        };
      });

      // Build handle from email
      const handle = this.username.replace('@', '');
      this.userQuestions = questions.map(q => ({ q, handle }));
      
    } catch (err) {
      console.error('Error loading user questions:', err);
      this.userQuestions = [];
    } finally {
      this.loadingQuestions = false;
    }
  }

}
