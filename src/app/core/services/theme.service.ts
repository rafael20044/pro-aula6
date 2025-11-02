import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeName = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private readonly storageKey = 'app-theme';
	private current: ThemeName = 'light';
	readonly theme$ = new BehaviorSubject<ThemeName>(this.current);

	constructor() {
		const saved = (localStorage.getItem(this.storageKey) as ThemeName) || 'light';
		this.setTheme(saved);
	}

	setTheme(name: ThemeName) {
		this.current = name;
		const root = document.documentElement;
		if (name === 'dark') {
			root.setAttribute('data-theme', 'dark');
		} else {
			root.removeAttribute('data-theme');
		}
		localStorage.setItem(this.storageKey, name);
		this.theme$.next(name);
	}

	toggle() {
		this.setTheme(this.current === 'dark' ? 'light' : 'dark');
	}

	isDark(): boolean { return this.current === 'dark'; }
}
