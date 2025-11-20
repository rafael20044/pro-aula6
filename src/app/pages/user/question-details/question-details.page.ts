import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IQuestionDetails } from 'src/app/interfaces/iquestiondetail';
import { QuestionService } from 'src/app/shared/services/question-service';

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

  constructor(
    private readonly active: ActivatedRoute,
    private readonly question: QuestionService
  ) { }

  async ngOnInit() {
    const idParam = this.active.snapshot.paramMap.get('id') || '0';
    this.id = parseInt(idParam, 10);
    await this.loadData();
  }

  private async loadData() {
    try {
      this.loading = true;
      const data = await this.question.getQuestionDetails(this.id);
      this.questionDetails = data;
    } catch (error) {
      console.error('Error al obtener la pregunta:', error);
    } finally {
      this.loading = false;
    }
  }
}
