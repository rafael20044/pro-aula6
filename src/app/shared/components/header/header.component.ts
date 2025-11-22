import { Component } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class HeaderComponent {
  constructor(public theme: ThemeService, private router: Router) {}

  toggleTheme() {
    this.theme.toggle();
  }

  goHome() {
    this.router.navigate(['/user/home']);
  }
}
