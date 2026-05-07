import { Injectable, signal } from '@angular/core';

export interface User {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  city?: string;
  profilePhoto?: string;
  bio?: string;
  phone?: string;
  role?: 'admin' | 'member';
  onboardingDone?: boolean;
  fitnessGoal?: string;
  experienceLevel?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  user = signal<User | null>(this.loadUser());

  private loadUser(): User | null {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  private persist(u: User): void {
    const json = JSON.stringify(u);
    if (localStorage.getItem('user')) {
      localStorage.setItem('user', json);
    } else {
      sessionStorage.setItem('user', json);
    }
  }

  setUser(u: User, remember: boolean): void {
    const json = JSON.stringify(u);
    remember
      ? localStorage.setItem('user', json)
      : sessionStorage.setItem('user', json);
    this.user.set(u);
  }

  updateName(name: string): void {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, name };
    this.user.set(updated);
    this.persist(updated);
  }

  completeOnboarding(fitnessGoal: string, experienceLevel: string): void {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, fitnessGoal, experienceLevel, onboardingDone: true };
    this.user.set(updated);
    this.persist(updated);
  }

  logout(): void {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.user.set(null);
  }
}
