import { Injectable, signal, effect, inject } from '@angular/core';
import { UserService } from './user.service';

export interface FitnessEntry {
  id: number;
  type: 'fitness';
  date: string;
  muscleGroups: string[];
  equipment: string;
  reps: number;
  kcal: number;
}

export interface BoulderingEntry {
  id: number;
  type: 'bouldering';
  date: string;
  routesFinished: number;
  routesFlashed: number;
  difficulty: string;
  durationMinutes: number;
  kcal: number;
}

export type JournalEntry = FitnessEntry | BoulderingEntry;

@Injectable({ providedIn: 'root' })
export class JournalService {
  private userService = inject(UserService);
  entries = signal<JournalEntry[]>([]);

  constructor() {
    // Reîncărcăm automat intrările din jurnal specifice utilizatorului curent
    effect(() => {
      const user = this.userService.user();
      if (user) {
        this.entries.set(this.load(user.email));
      } else {
        this.entries.set([]);
      }
    });
  }

  private load(email: string): JournalEntry[] {
    try {
      const rawScoped = localStorage.getItem('museHubJournal_' + email);
      if (rawScoped) {
        return JSON.parse(rawScoped) as JournalEntry[];
      }
      
      // Migrare unică pentru datele globale vechi (dacă există)
      const rawGlobal = localStorage.getItem('museHubJournal');
      if (rawGlobal) {
        localStorage.setItem('museHubJournal_' + email, rawGlobal);
        return JSON.parse(rawGlobal) as JournalEntry[];
      }
      
      return [];
    } catch {
      return [];
    }
  }

  private persist(email: string): void {
    localStorage.setItem('museHubJournal_' + email, JSON.stringify(this.entries()));
  }

  addEntry(entry: JournalEntry): void {
    const email = this.userService.user()?.email;
    if (!email) return;
    
    this.entries.update(list => [entry, ...list]);
    this.persist(email);
  }
}
