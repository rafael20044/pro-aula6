import { Component } from '@angular/core';
import { ThemeService } from 'src/app/core/services/theme.service';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-theme-toggle',
	templateUrl: './theme-toggle.component.html',
	styleUrls: ['./theme-toggle.component.scss'],
	standalone: true,
	imports: [IonicModule, CommonModule]
})
export class ThemeToggleComponent {
	isVisible = true;

	constructor(public theme: ThemeService, private router: Router) {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: any) => {
			this.checkVisibility(event.urlAfterRedirects || event.url);
		});
		this.checkVisibility(this.router.url);
	}

	checkVisibility(url: string) {
		this.isVisible = !url.includes('/admin/tags');
	}

	toggle() { this.theme.toggle(); }
}
