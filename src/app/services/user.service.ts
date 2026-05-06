import { Injectable, signal } from '@angular/core';

export interface User {
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  user = signal<User | null>(this.loadUser());

  private loadUser(): User | null {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  updateName(name: string): void {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, name };
    this.user.set(updated);
    if (localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('user', JSON.stringify(updated));
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.user.set(null);
  }
}
