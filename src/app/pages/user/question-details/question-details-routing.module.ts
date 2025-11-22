import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuestionDetailsPage } from './question-details.page';

const routes: Routes = [
  {
    path: '',
    component: QuestionDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuestionDetailsPageRoutingModule {}
