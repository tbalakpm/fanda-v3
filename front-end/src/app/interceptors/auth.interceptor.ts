import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

import { AuthService, LoginResponseData } from '../services/auth.service';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from '../services';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);
  let user!: LoginResponseData;
  authService.getUser().subscribe({
    next: (value) => {
      user = value;
    },
  });
  const authToken = user?.token;

  loaderService.showLoader();

  if (req.url.includes('login')) return next(req);

  if (!authToken) {
    const route = inject(Router);
    route.navigate(['auth/login']);
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 401,
          error: {
            message: 'Unauthorized',
            errors: [{ message: 'Please login to continue' }],
          },
        })
    );
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return next(authReq);
};
