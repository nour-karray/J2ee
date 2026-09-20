import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();

  if (!token) {
    return next(request).pipe(catchError((error) => {
      if (error.status === 401) {
        authService.logout();
        void router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }));
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  })).pipe(catchError((error) => {
    if (error.status === 401) {
      authService.logout();
      void router.navigateByUrl('/login');
    }
    return throwError(() => error);
  }));
};
