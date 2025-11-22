import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IQuestionBytitle } from 'src/app/interfaces/iquestionbytitle';
import { QuestionService } from '../../services/question-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: false,
})
export class SearchComponent  implements OnInit {

  searchControl = new FormControl('');
  results: IQuestionBytitle[] = [];
  searched = false;

  constructor(private readonly question:QuestionService, private readonly router:Router) { }

  ngOnInit() {}

  async search(){
    const text = this.searchControl.value;
    if (!text) {
      return;
    }
    this.results = await this.question.findByTitle(text);
  }


  goToQuestion(questionId: number) {
    console.log(questionId)
    this.router.navigate([`question-details/${questionId}`]);
  }

}
