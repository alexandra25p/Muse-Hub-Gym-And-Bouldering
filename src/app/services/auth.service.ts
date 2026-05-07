import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase';
import { db } from '../../firebase';
import { User } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  /**
   * Register a new user with email/password
   * Creates Firebase Auth user and saves profile to Firestore
   */
  async signUp(email: string, password: string, userData: User): Promise<User> {
    // Step 1: Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Step 2: Save user profile to Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const firestoreUser = {
      ...userData,
      uid: firebaseUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(userDocRef, firestoreUser);

    return firestoreUser as User;
  }

  /**
   * Login user with email/password
   * Retrieves user profile from Firestore
   */
  async login(email: string, password: string): Promise<User | null> {
    // Step 1: Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Step 2: Fetch user profile from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      console.warn('User authenticated but no profile found in Firestore');
      return null;
    }

    return userSnap.data() as User;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Get currently authenticated Firebase user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}
