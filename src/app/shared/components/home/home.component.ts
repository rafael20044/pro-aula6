import { Component, OnInit } from '@angular/core';
import { QuestionService } from 'src/app/shared/services/question-service';
import { AuthService } from 'src/app/shared/services/auth-service';
import { Supabase } from 'src/app/core/supabase/supabase';
import { Const } from 'src/app/const/const';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';

@Component({
  selector: 'app-home-c',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  feed: Array<{ q: IQuestionHome, handle?: string }> = [];
  loading = true;
  errorMsg?: string;
  currentUserId: number | null = null;
  
  // Paginación
  pageSize = 15; // Cargar 15 preguntas a la vez
  currentPage = 0;
  allQuestionsLoaded = false;
  isLoadingMore = false;

  constructor(
    private readonly questionService: QuestionService,
    private readonly auth: AuthService
  ) { }
  
  async ngOnInit() {
    await this.auth.ensureReady();
    const user = this.auth.getUser();
    if (user) {
      const { data } = await Supabase
        .from(Const.TB_USER)
        .select('id')
        .eq('uid', user.id)
        .single();
      this.currentUserId = data?.id || null;
    }
    this.loadData(true);
  }

  async loadData(reset = false) {
    if (reset) {
      this.currentPage = 0;
      this.feed = [];
      this.allQuestionsLoaded = false;
    }
    
    try {
      // Usar versión con caché
      let questions = await this.questionService.findAllQuestions(reset);
      
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        // Fallback a consulta directa
        const { data: directData } = await Supabase
          .from(Const.TB_QUESTIONS)
          .select('*')
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false })
          .limit(this.pageSize);
          
        questions = (directData || []).map((r: any) => ({
          question_id: r.id,
          user_id: r.user_id,
          full_name: r.full_name ?? '',
          photo: r.photo ?? null,
          title: r.title,
          body: r.body,
          images: r.images ?? [],
          tags: r.tags ?? [],
          comment_count: r.comment_count ?? 0,
          status: r.status ?? 'unknown',
          like_count: r.like_count ?? 0,
          dislike_count: r.dislike_count ?? 0,
        }));
      }

      // Filtrar preguntas eliminadas
      questions = questions.filter(q => q.status !== 'DELETE');
      
      // Tomar solo el chunk actual para paginación
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      const pageQuestions = questions.slice(start, end);
      
      if (pageQuestions.length < this.pageSize) {
        this.allQuestionsLoaded = true;
      }

      // Email → handle solo para las preguntas de esta página
      const userIds = [...new Set(pageQuestions.map(q => q.user_id))];
      const { data: users } = await Supabase
        .from(Const.TB_USER)
        .select('id,email')
        .in('id', userIds);

      const userMap = Object.fromEntries(
        (users || []).map(u => [u.id, u.email?.split('@')[0] ?? ''])
      );

      const mapped = pageQuestions.map(q => ({ q, handle: userMap[q.user_id] }));
      this.feed = reset ? mapped : [...this.feed, ...mapped];

    } catch (err) {
      console.error(err);
      this.errorMsg = 'No se pudieron cargar las preguntas.';
      if (reset) this.feed = [];
    } finally {
      this.loading = false;
      this.isLoadingMore = false;
    }
  }

  async loadMore(event: any) {
    if (this.allQuestionsLoaded || this.isLoadingMore) {
      event.target.complete();
      return;
    }
    
    this.isLoadingMore = true;
    this.currentPage++;
    await this.loadData(false);
    event.target.complete();
  }

  async refresh(event: any) {
    // Forzar recarga desde servidor
    this.questionService.clearCache();
    await this.loadData(true);
    event.target.complete();
  }
}
