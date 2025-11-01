import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  showLogo = true;

  constructor(private router: Router) {}

  onTabChange(event: any) {
    const selectedTab = event.tab;
    this.showLogo = selectedTab === 'home';
  }

  goToCreateQuestion() {
    this.router.navigate(['/user/create-question']);
  }
}