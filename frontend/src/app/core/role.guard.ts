import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const roleGuard = (roles: Role[]): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.canAccess(roles) ? true : router.createUrlTree(['/']);
};
