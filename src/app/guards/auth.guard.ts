import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const isLoggedIn = !!localStorage.getItem('user');

  if (!isLoggedIn) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
