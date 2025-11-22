import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './components/input/input.component';
import { IonicModule } from '@ionic/angular';
import { ButtonComponent } from './components/button/button.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ProfileComponent } from './components/profile/profile.component';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { TagPickerComponent } from './components/tag-picker/tag-picker.component';
import { QuestionCardComponent } from './components/question-card/question-card.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { HeaderComponent } from './components/header/header.component';



@NgModule({
  declarations: [
    InputComponent,
    ButtonComponent,
    UserFormComponent,
    HomeComponent,
    SearchComponent,
    NotificationComponent,
    ProfileComponent,
    QuestionFormComponent,
    TagPickerComponent,
    QuestionCardComponent,
  ],
  providers: [],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    ThemeToggleComponent,
  ],
  exports: [
    InputComponent,
    ButtonComponent,
    UserFormComponent,
    HomeComponent,
    SearchComponent,
    NotificationComponent,
    ProfileComponent,
    QuestionFormComponent,
    TagPickerComponent,
    QuestionCardComponent,
    ThemeToggleComponent,
    HeaderComponent,
  ],
})
export class SharedModule { }
