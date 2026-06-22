import { Injectable, signal } from '@angular/core';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase';

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
  status?: 'active' | 'inactive';
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

  async completeOnboarding(fitnessGoal: string, experienceLevel: string): Promise<void> {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, fitnessGoal, experienceLevel, onboardingDone: true };
    this.user.set(updated);
    this.persist(updated);

    // Salvare persistentă în Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
          fitnessGoal,
          experienceLevel,
          onboardingDone: true
        });
        console.log('Onboarding salvat cu succes în Firestore.');
      } catch (error) {
        console.error('Eroare la salvarea onboarding-ului în Firestore:', error);
      }
    }
  }

  async syncUserWithFirestore(): Promise<void> {
    const current = this.user();
    if (!current) return;

    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const freshData = userSnap.data() as User;
          const updated: User = {
            ...current,
            name: freshData.firstName || freshData.name || current.name,
            firstName: freshData.firstName,
            lastName: freshData.lastName,
            city: freshData.city,
            birthDate: freshData.birthDate,
            phone: freshData.phone,
            bio: freshData.bio,
            profilePhoto: freshData.profilePhoto,
            role: freshData.role || 'member',
            status: freshData.status || 'active',
            onboardingDone: freshData.onboardingDone ?? false,
            fitnessGoal: freshData.fitnessGoal,
            experienceLevel: freshData.experienceLevel
          };
          this.user.set(updated);
          this.persist(updated);
          console.log('Profilul utilizatorului s-a sincronizat cu succes din Firestore.');
        }
      } catch (error) {
        console.error('Eroare la sincronizarea profilului cu Firestore:', error);
      }
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.user.set(null);
  }
}
