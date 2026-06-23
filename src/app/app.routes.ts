import { Routes } from '@angular/router';
import { adminGuard, authGuard, memberGuard, unauthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { 
    path: 'signup', 
    loadComponent: () => import('./features/signup/signup').then(m => m.SignUp),
    canActivate: [unauthGuard] 
  },
  { path: 'login', redirectTo: 'signup', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'journal',
    loadComponent: () => import('./features/journal/journal').then(m => m.Journal),
    canActivate: [authGuard, memberGuard],
  },
  {
    path: 'classes',
    loadComponent: () => import('./features/classes/classes').then(m => m.Classes),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
    canActivate: [authGuard, memberGuard],
  },
  {
    path: 'wall',
    loadComponent: () => import('./features/wall/wall').then(m => m.Wall),
    canActivate: [authGuard],
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard').then(m => m.Leaderboard),
    canActivate: [authGuard, memberGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.Admin),
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: '' },
];
