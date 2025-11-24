import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Const } from 'src/app/const/const';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone:false,
})
export class WelcomePage {

  constructor(private readonly router:Router, private readonly local:LocalStorageService){}

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

  goToLogin(){
    console.debug('WelcomePage: goToLogin called, rulesCount=', this.rules?.length);
    try{
      this.local.set(Const.SHOW_WELCOME, false);
    }catch(err){
      
    }
    this.router.navigate(['/auth/login']);
  }
}
