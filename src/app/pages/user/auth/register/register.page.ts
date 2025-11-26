import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  constructor() {}

  onFormSubmit(formData: any) {
    console.log('Form Data Submitted:', formData);
  }
}
