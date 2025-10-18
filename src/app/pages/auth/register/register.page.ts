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
    console.log('Register data:', formData);
    // Aquí irá la lógica de registro con Supabase
    // formData contiene: { name, name2, last_name, last_name2, email, password, rol, photo, photoFile }
  }
}
