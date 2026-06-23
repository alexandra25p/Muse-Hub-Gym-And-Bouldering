import { Injectable, signal } from '@angular/core';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export interface GymClass {
  id: string; // ID unic stocat ca string (ID-ul documentului din Firestore)
  name: string;
  type: string;
  instructor: string;
  day: string;
  time: string;
  capacity: number;
  enrolled: string[];
  attended: string[];
}

const SEED = [
  { id: 1, name: 'Morning Yoga', type: 'Yoga', instructor: 'Ana Ionescu', day: 'Monday', time: '08:00', capacity: 15, enrolled: [], attended: [] },
  { id: 2, name: 'HIIT Blast', type: 'HIIT', instructor: 'Mihai Pop', day: 'Tuesday', time: '18:00', capacity: 20, enrolled: [], attended: [] },
  { id: 3, name: 'Boulder Basics', type: 'Bouldering', instructor: 'Radu Stan', day: 'Wednesday', time: '17:00', capacity: 12, enrolled: [], attended: [] },
  { id: 4, name: 'Strength & Core', type: 'Strength', instructor: 'Elena Marin', day: 'Thursday', time: '19:00', capacity: 18, enrolled: [], attended: [] },
  { id: 5, name: 'Weekend Climb', type: 'Bouldering', instructor: 'Radu Stan', day: 'Saturday', time: '10:00', capacity: 10, enrolled: [], attended: [] },
];

@Injectable({ providedIn: 'root' })
export class ClassesService {
  classes = signal<GymClass[]>([]);

  constructor() {
    // Ascultăm în timp real colecția "classes" din Firestore
    onSnapshot(
      collection(db, 'classes'), 
      (snapshot) => {
        const list: GymClass[] = [];
        snapshot.forEach(docSnap => {
          list.push({
            id: docSnap.id,
            ...docSnap.data()
          } as GymClass);
        });

        // Dacă Firestore este gol la prima inițializare, populăm cu datele inițiale
        if (list.length === 0) {
          this.seedInitialClasses();
        } else {
          // Sortăm clasele după zi/oră sau după id pentru consistență vizuală
          list.sort((a, b) => a.id.localeCompare(b.id));
          this.classes.set(list);
        }
      },
      (error) => {
        console.error('❌ Firestore onSnapshot error (classes):', error.code, error.message);
      }
    );
  }

  private async seedInitialClasses(): Promise<void> {
    console.log('Seeding initial classes to Firestore...');
    for (const c of SEED) {
      const { id, ...data } = c;
      const docRef = doc(db, 'classes', `class_${id}`);
      await setDoc(docRef, {
        ...data,
        id: `class_${id}`
      });
    }
  }

  async toggleBooking(classId: string, email: string): Promise<void> {
    const cls = this.classes().find(c => c.id === classId);
    if (!cls) return;

    const booked = cls.enrolled.includes(email);
    if (!booked && cls.enrolled.length >= cls.capacity) return;

    const newEnrolled = booked
      ? cls.enrolled.filter(e => e !== email)
      : [...cls.enrolled, email];

    try {
      const docRef = doc(db, 'classes', classId);
      await updateDoc(docRef, { enrolled: newEnrolled });
    } catch (err) {
      console.error('Error toggling booking in Firestore:', err);
    }
  }

  isBooked(classId: string, email: string): boolean {
    return this.classes().find(c => c.id === classId)?.enrolled.includes(email) ?? false;
  }

  isFull(classId: string): boolean {
    const cls = this.classes().find(c => c.id === classId);
    return cls ? cls.enrolled.length >= cls.capacity : false;
  }

  async markAttendance(classId: string, email: string, present: boolean): Promise<void> {
    const cls = this.classes().find(c => c.id === classId);
    if (!cls) return;

    const newAttended = present
      ? [...new Set([...cls.attended, email])]
      : cls.attended.filter(e => e !== email);

    try {
      const docRef = doc(db, 'classes', classId);
      await updateDoc(docRef, { attended: newAttended });
    } catch (err) {
      console.error('Error marking attendance in Firestore:', err);
    }
  }

  isAttended(classId: string, email: string): boolean {
    return this.classes().find(c => c.id === classId)?.attended.includes(email) ?? false;
  }

  async addClass(data: Omit<GymClass, 'id' | 'enrolled' | 'attended'>): Promise<void> {
    try {
      const classesCollection = collection(db, 'classes');
      const docRef = await addDoc(classesCollection, {
        ...data,
        enrolled: [],
        attended: []
      });
      // Salvăm și ID-ul documentului în interiorul câmpului "id" pentru consistență
      await updateDoc(docRef, { id: docRef.id });
    } catch (err) {
      console.error('Error adding class to Firestore:', err);
    }
  }

  async updateClass(id: string, data: Omit<GymClass, 'id' | 'enrolled' | 'attended'>): Promise<void> {
    try {
      const docRef = doc(db, 'classes', id);
      await updateDoc(docRef, {
        name: data.name,
        type: data.type,
        instructor: data.instructor,
        day: data.day,
        time: data.time,
        capacity: data.capacity
      });
    } catch (err) {
      console.error('Error updating class in Firestore:', err);
    }
  }

  async deleteClass(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'classes', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting class from Firestore:', err);
    }
  }
}
