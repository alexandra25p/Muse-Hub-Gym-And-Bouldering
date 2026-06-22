import { Injectable, signal } from '@angular/core';

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
  entries = signal<JournalEntry[]>(this.load());

  private load(): JournalEntry[] {
    try {
      const raw = localStorage.getItem('museHubJournal');
      return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem('museHubJournal', JSON.stringify(this.entries()));
  }

  addEntry(entry: JournalEntry): void {
    this.entries.update(list => [entry, ...list]);
    this.persist();
  }
}
