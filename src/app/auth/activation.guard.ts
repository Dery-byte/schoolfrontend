import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const activationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Allow access if registered OR if coming from registration
  if (authService.isRegistered() || authService.isComingFromRegistration()) {
    return true;
  }
  
  router.navigate(['']);
  return false;
};