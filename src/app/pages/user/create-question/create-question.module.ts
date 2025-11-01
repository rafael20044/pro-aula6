import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CreateQuestionPageRoutingModule } from './create-question-routing.module';
import { CreateQuestionPage } from './create-question.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateQuestionPageRoutingModule,
    SharedModule
  ],
  declarations: [CreateQuestionPage]
})
export class CreateQuestionPageModule {}
