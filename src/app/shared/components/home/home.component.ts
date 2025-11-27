import { Component, OnInit } from '@angular/core';
import { QuestionService } from 'src/app/shared/services/question-service';
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

  constructor(private readonly questionService: QuestionService) { }

  async ngOnInit() {
    this.loadData(true);
  }

  async loadData(random = false) {
    try {
      let questions = await this.questionService.findAllQuestions();
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        const { data: directData } = await Supabase.from(Const.TB_QUESTIONS).select('*');
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

      // Email → handle
      const userIds = [...new Set(questions.map(q => q.user_id))];
      const { data: users } = await Supabase.from(Const.TB_USER).select('id,email').in('id', userIds);

      const userMap = Object.fromEntries(
        (users || []).map(u => [u.id, u.email?.split('@')[0] ?? ''])
      );

      let mapped = questions.map(q => ({ q, handle: userMap[q.user_id] }));

      // Solo mezclar si es primera vez
      this.feed = random ? this.shuffleArray(mapped) : mapped;

    } catch (err) {
      console.error(err);
      this.errorMsg = 'No se pudieron cargar las preguntas.';
      this.feed = [];
    } finally {
      this.loading = false;
    }
  }

  async refresh(event: any) {
    await this.loadData(true);
    event.target.complete();
  }


  // Fisher-Yates shuffle algorithm para aleatorizar array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  refresh() {
    this.loadData(true);
  }

}
