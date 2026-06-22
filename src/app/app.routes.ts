import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'signup', loadComponent: () => import('./features/signup/signup').then(m => m.SignUp) },
  { path: 'login', redirectTo: 'signup', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'journal',
    loadComponent: () => import('./features/journal/journal').then(m => m.Journal),
    canActivate: [authGuard],
  },
  {
    path: 'classes',
    loadComponent: () => import('./features/classes/classes').then(m => m.Classes),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'wall',
    loadComponent: () => import('./features/wall/wall').then(m => m.Wall),
    canActivate: [authGuard],
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard').then(m => m.Leaderboard),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.Admin),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
