import { Injectable, signal } from '@angular/core';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export interface WallRoute {
  id: string; 
  name: string;
  grade: string;
  setter: string;
  dateSet: string;
  color: string;
  completedBy: string[];
}

const SEED = [
  { id: 1, name: 'Purple Rain', grade: 'V2', setter: 'Radu Stan', dateSet: '2026-04-01', color: 'purple', completedBy: [] },
  { id: 2, name: 'Blue Horizon', grade: 'V4', setter: 'Radu Stan', dateSet: '2026-04-01', color: 'blue', completedBy: [] },
  { id: 3, name: 'Crimson Tide', grade: 'V1', setter: 'Mihai Pop', dateSet: '2026-04-15', color: 'red', completedBy: [] },
  { id: 4, name: 'Green Machine', grade: 'V5', setter: 'Radu Stan', dateSet: '2026-04-15', color: 'green', completedBy: [] },
  { id: 5, name: 'Orange Crush', grade: 'V3', setter: 'Mihai Pop', dateSet: '2026-04-22', color: 'orange', completedBy: [] },
  { id: 6, name: 'Yellow Brick', grade: 'V0', setter: 'Ana Ionescu', dateSet: '2026-04-22', color: 'yellow', completedBy: [] },
  { id: 7, name: 'Black Diamond', grade: 'V7', setter: 'Radu Stan', dateSet: '2026-04-28', color: 'black', completedBy: [] },
  { id: 8, name: 'White Noise', grade: 'V6', setter: 'Mihai Pop', dateSet: '2026-04-28', color: 'white', completedBy: [] },
  { id: 9, name: 'Violet Storm', grade: 'V9', setter: 'Radu Stan', dateSet: '2026-05-02', color: 'purple', completedBy: [] },
  { id: 10, name: 'Solar Flare', grade: 'V3', setter: 'Ana Ionescu', dateSet: '2026-05-02', color: 'orange', completedBy: [] },
];

@Injectable({ providedIn: 'root' })
export class WallService {
  routes = signal<WallRoute[]>([]);

  constructor() {
    onSnapshot(
      collection(db, 'routes'),
      (snapshot) => {
        const list: WallRoute[] = [];
        snapshot.forEach(docSnap => {
          list.push({
            id: docSnap.id,
            ...docSnap.data()
          } as WallRoute);
        });

        if (list.length === 0) {
          this.seedInitialRoutes();
        } else {
          list.sort((a, b) => a.id.localeCompare(b.id));
          this.routes.set(list);
        }
      },
      (error) => {
        console.error('❌ Firestore onSnapshot error (routes):', error.code, error.message);
      }
    );
  }

  private async seedInitialRoutes(): Promise<void> {
    console.log('Seeding initial bouldering routes to Firestore...');
    for (const r of SEED) {
      const { id, ...data } = r;
      const docRef = doc(db, 'routes', `route_${id}`);
      await setDoc(docRef, {
        ...data,
        id: `route_${id}`
      });
    }
  }

  async toggleComplete(routeId: string, email: string): Promise<void> {
    const route = this.routes().find(r => r.id === routeId);
    if (!route) return;

    const done = route.completedBy.includes(email);
    const newCompletedBy = done
      ? route.completedBy.filter(e => e !== email)
      : [...route.completedBy, email];

    try {
      const docRef = doc(db, 'routes', routeId);
      await updateDoc(docRef, { completedBy: newCompletedBy });
    } catch (err) {
      console.error('Error toggling route completion in Firestore:', err);
    }
  }

  async addRoute(data: Omit<WallRoute, 'id' | 'completedBy'>): Promise<void> {
    try {
      const routesCollection = collection(db, 'routes');
      const docRef = await addDoc(routesCollection, {
        ...data,
        completedBy: []
      });
      await updateDoc(docRef, { id: docRef.id });
    } catch (err) {
      console.error('Error adding route to Firestore:', err);
    }
  }

  async updateRoute(id: string, data: Omit<WallRoute, 'id' | 'completedBy'>): Promise<void> {
    try {
      const docRef = doc(db, 'routes', id);
      await updateDoc(docRef, {
        name: data.name,
        grade: data.grade,
        setter: data.setter,
        dateSet: data.dateSet,
        color: data.color
      });
    } catch (err) {
      console.error('Error updating route in Firestore:', err);
    }
  }

  async deleteRoute(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'routes', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting route from Firestore:', err);
    }
  }
}
