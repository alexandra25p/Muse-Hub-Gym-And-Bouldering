import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { User } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  async signUp(email: string, password: string, userData: User): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const firestoreUser = {
        ...userData,
        uid: firebaseUser.uid, // ID-ul Firebase
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(userDocRef, firestoreUser);

      return firestoreUser as User;
    } catch (error: any) {
      console.error('❌ SignUp Error:', error.code, error.message);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        console.warn('⚠️ User autentificat dar profil nu găsit în Firestore');
        return null;
      }

      return userSnap.data() as User;
    } catch (error: any) {
      console.error('❌ Login Error:', error.code, error.message);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✓ Logout success');
    } catch (error: any) {
      console.error('❌ Logout Error:', error.message);
      throw error;
    }
  }
}
