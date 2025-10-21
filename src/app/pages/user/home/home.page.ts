import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

   showLogo = true;
    onTabChange(event: any) {
    const selectedTab = event.tab;
    this.showLogo = selectedTab === 'home';


}
}