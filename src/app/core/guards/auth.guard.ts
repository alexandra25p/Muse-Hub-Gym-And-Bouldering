import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isLoggedIn = !!(localStorage.getItem('user') || sessionStorage.getItem('user'));

  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const unauthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isLoggedIn = !!(localStorage.getItem('user') || sessionStorage.getItem('user'));

  if (isLoggedIn) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const isAdmin = user?.email === 'admin@muse.com';

  if (!isAdmin) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

export const memberGuard: CanActivateFn = () => {
  const router = inject(Router);
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const isAdmin = user?.email === 'admin@muse.com';

  if (isAdmin) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
