import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone:false,
})
export class WelcomePage {
  rules = [
    {
      title: 'Sé divertido',
      description: 'Disfruta del juego y comparte buenas energías con los demás.',
      icon: 'assets/icon/divertido.png'
    },
    {
      title: 'Sé curioso',
      description: 'Haz preguntas interesantes y aprende de otros usuarios.',
      icon: 'assets/icon/preguntas.png'
    },
    {
      title: 'Sé respetuoso',
      description: 'Respeta todas las opiniones y evita el lenguaje ofensivo.',
      icon: 'assets/icon/respect.png'
    },
    {
      title: 'Sé sincero',
      description: 'Responde con honestidad y autenticidad.',
      icon: 'assets/icon/sinceridad.png'
    }
  ];
}
