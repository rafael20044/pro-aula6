import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuestionDetailsPageRoutingModule } from './question-details-routing.module';

import { QuestionDetailsPage } from './question-details.page';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuestionDetailsPageRoutingModule,
    SharedModule,
  ],
  declarations: [QuestionDetailsPage]
})
export class QuestionDetailsPageModule {}
