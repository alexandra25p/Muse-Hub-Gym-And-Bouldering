import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup').then(m => m.SignUp) },
  { path: 'login', redirectTo: 'signup', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'journal',
    loadComponent: () => import('./pages/journal/journal').then(m => m.Journal),
    canActivate: [authGuard],
  },
  {
    path: 'classes',
    loadComponent: () => import('./pages/classes/classes').then(m => m.Classes),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'wall',
    loadComponent: () => import('./pages/wall/wall').then(m => m.Wall),
    canActivate: [authGuard],
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./pages/leaderboard/leaderboard').then(m => m.Leaderboard),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then(m => m.Admin),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
