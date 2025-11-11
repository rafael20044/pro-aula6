import { Component } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { IonicModule } from '@ionic/angular';

@Component({
	selector: 'app-theme-toggle',
	templateUrl: './theme-toggle.component.html',
	styleUrls: ['./theme-toggle.component.scss'],
	standalone: true,
	imports: [IonicModule]
})
export class ThemeToggleComponent {
	constructor(public theme: ThemeService) {}
	toggle() { this.theme.toggle(); }
}
