import { Component } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
	selector: 'app-theme-toggle',
	templateUrl: './theme-toggle.component.html',
	styleUrls: ['./theme-toggle.component.scss'],
	standalone: false,
})
export class ThemeToggleComponent {
	constructor(public theme: ThemeService) {}
	toggle() { this.theme.toggle(); }
}
