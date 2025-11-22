import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.page.html',
  styleUrls: ['./create-question.page.scss'],
  standalone: false,
})
export class CreateQuestionPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onQuestionSubmit(questionData: any) {
    console.log('Question data:', questionData);
    // TODO: enviar a servicio para crear pregunta
    // this.questionService.createQuestion(questionData).subscribe(...);
    // Por ahora navegar de vuelta al home
    this.router.navigate(['/user/home']);
  }

  goBack() {
    this.router.navigate(['/user/home']);
  }

}
