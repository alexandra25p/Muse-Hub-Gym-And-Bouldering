import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
  dark = signal(localStorage.getItem('museHubDark') === '1');

  constructor() {
    this.apply(this.dark());
  }

  toggle(): void {
    const next = !this.dark();
    this.dark.set(next);
    localStorage.setItem('museHubDark', next ? '1' : '0');
    this.apply(next);
  }

  private apply(dark: boolean): void {
    document.body.classList.toggle('dark-mode', dark);
  }
}
