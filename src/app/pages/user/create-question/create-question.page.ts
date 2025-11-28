import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IQuestionHome } from 'src/app/interfaces/iquiestionhome';
import { QuestionService } from 'src/app/shared/services/question-service';
import { Const } from 'src/app/const/const';
import { Supabase } from 'src/app/core/supabase/supabase';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.page.html',
  styleUrls: ['./create-question.page.scss'],
  standalone: false,
})
export class CreateQuestionPage implements OnInit {
  isEditing: boolean = false;
  existingQuestion: IQuestionHome | null = null;
  loading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private questionService: QuestionService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      const questionId = params['edit'];
      if (questionId) {
        // Limpiar datos anteriores antes de cargar nuevos
        this.existingQuestion = null;
        this.isEditing = true;
        this.loading = true;
        await this.loadQuestionForEdit(questionId);
        this.loading = false;
      } else {
        // Modo creación
        this.isEditing = false;
        this.existingQuestion = null;
      }
    });
  }

  private async loadQuestionForEdit(questionId: number) {
    try {
      const [questionResult, imagesResult, tagsResult] = await Promise.all([
        Supabase
          .from(Const.TB_QUESTIONS)
          .select('*')
          .eq('id', questionId)
          .single(),
        Supabase
          .from(Const.TB_IMAGES)
          .select('*')
          .eq('question_id', questionId),
        Supabase
          .from(Const.TB_TAGS_QUESTIONS)
          .select(`
            tags!inner(
              name
            )
          `)
          .eq('question_id', questionId)
      ]);

      const questionData = questionResult.data;
      const qError = questionResult.error;

      if (qError || !questionData) {
        console.error('Error loading question:', qError);
        return;
      }

      const images = imagesResult.data;
      const tags = tagsResult.data?.map((t: any) => t.tags?.name).filter(Boolean) || [];

      this.existingQuestion = {
        question_id: questionData.id,
        user_id: questionData.user_id,
        full_name: questionData.full_name || '',
        photo: questionData.photo || null,
        title: questionData.title,
        body: questionData.body,
        images: images || [],
        tags: tags,
        comment_count: questionData.comment_count || 0,
        status: questionData.status || 'unknown',
        like_count: questionData.like_count || 0,
        dislike_count: questionData.dislike_count || 0,
      };
    } catch (err) {
      console.error('Error in loadQuestionForEdit:', err);
    }
  }

  onQuestionSubmit(questionData: any) {
    this.router.navigate(['/user/home']);
  }

  goBack() {
    this.router.navigate(['/user/home']);
  }

}
