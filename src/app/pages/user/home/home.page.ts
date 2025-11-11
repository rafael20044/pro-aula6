import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/shared/services/local-storage-service';
import { UserService } from 'src/app/shared/services/user-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit{

  showLogo = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    
  }

  onTabChange(event: any) {
    const selectedTab = event.tab;
    this.showLogo = selectedTab === 'home';
  }

  goToCreateQuestion() {
    this.router.navigate(['/user/create-question']);
  }
}