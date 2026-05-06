import { Injectable, signal } from '@angular/core';

export interface WallRoute {
  id: number;
  name: string;
  grade: string;
  setter: string;
  dateSet: string;
  color: string;
  completedBy: string[];
}

const SEED: WallRoute[] = [
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
  private nextId = signal(11);
  routes = signal<WallRoute[]>(this.load());

  private load(): WallRoute[] {
    try {
      const raw = localStorage.getItem('museHubWall');
      return raw ? (JSON.parse(raw) as WallRoute[]) : SEED;
    } catch {
      return SEED;
    }
  }

  private persist(): void {
    localStorage.setItem('museHubWall', JSON.stringify(this.routes()));
  }

  toggleComplete(routeId: number, email: string): void {
    this.routes.update(list =>
      list.map(r => {
        if (r.id !== routeId) return r;
        const done = r.completedBy.includes(email);
        return {
          ...r,
          completedBy: done ? r.completedBy.filter(e => e !== email) : [...r.completedBy, email],
        };
      })
    );
    this.persist();
  }

  addRoute(data: Omit<WallRoute, 'id' | 'completedBy'>): void {
    const id = this.nextId();
    this.routes.update(list => [...list, { id, completedBy: [], ...data }]);
    this.nextId.update(n => n + 1);
    this.persist();
  }

  updateRoute(id: number, data: Omit<WallRoute, 'id' | 'completedBy'>): void {
    this.routes.update(list =>
      list.map(r => (r.id === id ? { id, completedBy: r.completedBy, ...data } : r))
    );
    this.persist();
  }

  deleteRoute(id: number): void {
    this.routes.update(list => list.filter(r => r.id !== id));
    this.persist();
  }
}
