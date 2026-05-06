import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Auth } from './pages/auth/auth';
import { Classes } from './pages/classes/classes';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { Journal } from './pages/journal/journal';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Auth },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'journal', component: Journal, canActivate: [authGuard] },
  { path: 'classes', component: Classes, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
