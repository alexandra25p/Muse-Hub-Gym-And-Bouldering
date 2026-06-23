import { Injectable, signal, effect, inject } from '@angular/core';
import { UserService } from './user.service';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export interface FitnessEntry {
  id: string; // ID-ul unic din Firestore
  type: 'fitness';
  date: string;
  muscleGroups: string[];
  equipment: string;
  reps: number;
  kcal: number;
}

export interface BoulderingEntry {
  id: string; // ID-ul unic din Firestore
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
  private unsubscribe: (() => void) | null = null;

  constructor() {
    // Sincronizăm automat intrările în funcție de sesiunea utilizatorului curent
    effect((onCleanup) => {
      const user = this.userService.user();

      // Ne dezabonăm de la ascultătorul anterior dacă sesiunea s-a schimbat
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      if (user) {
        // Interogare în Firestore filtrată după emailul utilizatorului logat
        const q = query(
          collection(db, 'workouts'),
          where('userEmail', '==', user.email)
        );

        this.unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const list: JournalEntry[] = [];
            snapshot.forEach(docSnap => {
              list.push({
                id: docSnap.id,
                ...docSnap.data()
              } as JournalEntry);
            });

            // Sortăm descrescător după dată (cele mai recente primele)
            list.sort((a, b) => b.date.localeCompare(a.date));
            this.entries.set(list);
          },
          (error) => {
            console.error('❌ Firestore onSnapshot error (workouts):', error.code, error.message);
          }
        );
      } else {
        this.entries.set([]);
      }

      // Curățare la distrugerea efectului / schimbarea sesiunii
      onCleanup(() => {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      });
    });
  }

  async addEntry(entry: Omit<JournalEntry, 'id'>): Promise<void> {
    const email = this.userService.user()?.email;
    if (!email) return;

    try {
      const workoutsCollection = collection(db, 'workouts');
      await addDoc(workoutsCollection, {
        ...entry,
        userEmail: email
      });
    } catch (err) {
      console.error('Error adding workout entry to Firestore:', err);
    }
  }
}
