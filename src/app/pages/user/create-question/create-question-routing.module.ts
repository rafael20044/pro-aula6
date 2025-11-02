import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


export class CreateQuestionPage {}

const routes: Routes = [
  {
    path: '',
    component: CreateQuestionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateQuestionPageRoutingModule {}
