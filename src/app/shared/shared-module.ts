import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './components/input/input.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonComponent } from './components/button/button.component';



@NgModule({
  declarations: [
    InputComponent,
    ButtonComponent,
  ],
  providers: [],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
],
  exports: [
    InputComponent,
    ButtonComponent,
  ],
})
export class SharedModule { }
