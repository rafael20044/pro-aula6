import { Component, OnInit } from '@angular/core';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
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
export class HomeComponent  implements OnInit {
  feed: Array<{ q: IQuestionHome, handle?: string }> = [];
  loading = true;
  errorMsg?: string;

  constructor(private readonly questionService: QuestionService) { }

  async ngOnInit() {
    try {
      let questions = await this.questionService.findAllQuestions();
      console.debug('Questions from RPC:', questions);
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        // Try a simple fallback: select directly from the questions table
        console.warn('RPC returned no questions, trying direct table select as fallback');
        const { data: directData, error: directErr } = await Supabase.from(Const.TB_QUESTIONS).select('*');
        if (directErr) {
          console.error('Direct select failed:', directErr);
          this.feed = [];
          this.loading = false;
          return;
        }

        // Map directData to the IQuestionHome-compatible shape conservatively
        const mapped = (directData || []).map((r: any) => ({
          question_id: r.id ?? r.question_id,
          user_id: r.user_id ?? r.user,
          full_name: r.full_name ?? r.name ?? '',
          photo: r.photo ?? null,
          title: r.title ?? '',
          body: r.body ?? '',
          images: r.images ?? [],
          tags: r.tags ?? [],
          comment_count: r.comment_count ?? r.answer_count ?? 0,
          status: r.status ?? 'unknown',
          like_count: r.like_count ?? 0,
          dislike_count: r.dislike_count ?? 0,
        })) as IQuestionHome[];

        questions = mapped;
      }

      // Batch fetch users for all unique user_ids to avoid N requests
      const userIds = Array.from(new Set(questions.map((q: any) => q.user_id))).filter(Boolean);
      let userMap: Record<number, string> = {};

      if (userIds.length > 0) {
        const { data: users, error: userErr } = await Supabase
          .from(Const.TB_USER)
          .select('id,email')
          .in('id', userIds as any[]);

        if (userErr) {
          console.warn('Could not fetch users batch:', userErr);
        } else if (Array.isArray(users)) {
          users.forEach((u: any) => {
            if (u && u.id) userMap[u.id] = u.email || '';
          });
        }
      }

      this.feed = questions.map((q: IQuestionHome) => {
        const email = userMap[q.user_id] || '';
        const handle = email ? email.split('@')[0] : undefined;
        return { q, handle };
      });

    } catch (err) {
      console.error('Error loading questions for home feed', err);
      this.errorMsg = 'No se pudieron cargar las preguntas.';
      this.feed = [];
    } finally {
      this.loading = false;
    }
  }

  async loadData(){
    console.log("Hola")
    await this.ngOnInit();
  }

}
