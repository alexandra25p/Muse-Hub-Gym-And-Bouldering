import { Injectable, signal } from '@angular/core';

export interface GymClass {
  id: number;
  name: string;
  type: string;
  instructor: string;
  day: string;
  time: string;
  capacity: number;
  enrolled: string[];
  attended: string[];
}

const SEED: GymClass[] = [
  { id: 1, name: 'Morning Yoga', type: 'Yoga', instructor: 'Ana Ionescu', day: 'Monday', time: '08:00', capacity: 15, enrolled: [], attended: [] },
  { id: 2, name: 'HIIT Blast', type: 'HIIT', instructor: 'Mihai Pop', day: 'Tuesday', time: '18:00', capacity: 20, enrolled: [], attended: [] },
  { id: 3, name: 'Boulder Basics', type: 'Bouldering', instructor: 'Radu Stan', day: 'Wednesday', time: '17:00', capacity: 12, enrolled: [], attended: [] },
  { id: 4, name: 'Strength & Core', type: 'Strength', instructor: 'Elena Marin', day: 'Thursday', time: '19:00', capacity: 18, enrolled: [], attended: [] },
  { id: 5, name: 'Weekend Climb', type: 'Bouldering', instructor: 'Radu Stan', day: 'Saturday', time: '10:00', capacity: 10, enrolled: [], attended: [] },
];

@Injectable({ providedIn: 'root' })
export class ClassesService {
  private nextId = signal(6);
  classes = signal<GymClass[]>(SEED);

  toggleBooking(classId: number, email: string): void {
    this.classes.update(list =>
      list.map(c => {
        if (c.id !== classId) return c;
        const booked = c.enrolled.includes(email);
        if (!booked && c.enrolled.length >= c.capacity) return c;
        return {
          ...c,
          enrolled: booked ? c.enrolled.filter(e => e !== email) : [...c.enrolled, email],
        };
      })
    );
  }

  isBooked(classId: number, email: string): boolean {
    return this.classes().find(c => c.id === classId)?.enrolled.includes(email) ?? false;
  }

  isFull(classId: number): boolean {
    const cls = this.classes().find(c => c.id === classId);
    return cls ? cls.enrolled.length >= cls.capacity : false;
  }

  markAttendance(classId: number, email: string, present: boolean): void {
    this.classes.update(list =>
      list.map(c => {
        if (c.id !== classId) return c;
        const attended = present
          ? [...new Set([...c.attended, email])]
          : c.attended.filter(e => e !== email);
        return { ...c, attended };
      })
    );
  }

  isAttended(classId: number, email: string): boolean {
    return this.classes().find(c => c.id === classId)?.attended.includes(email) ?? false;
  }

  addClass(data: Omit<GymClass, 'id' | 'enrolled' | 'attended'>): void {
    const id = this.nextId();
    this.classes.update(list => [...list, { id, enrolled: [], attended: [], ...data }]);
    this.nextId.update(n => n + 1);
  }

  updateClass(id: number, data: Omit<GymClass, 'id' | 'enrolled' | 'attended'>): void {
    this.classes.update(list =>
      list.map(c => (c.id === id ? { id, enrolled: c.enrolled, attended: c.attended, ...data } : c))
    );
  }

  deleteClass(id: number): void {
    this.classes.update(list => list.filter(c => c.id !== id));
  }
}
