import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { AuthService, LoaderService } from '@services';

const api: any = {
  organizations: 'Organization',
  products: 'Product',
  'product-categories': 'Product Category',
  units: 'Unit',
  suppliers: 'Supplier',
  customers: 'Customer',
  purchase: 'Purchase',
  users: 'User',
};

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const _messageService = inject(NzMessageService);
  const _notificationService = inject(NzNotificationService);
  const _loaderService = inject(LoaderService);
  const _authService = inject(AuthService);

  return next(req).pipe(
    tap((event) => {
      if (
        event instanceof HttpResponse &&
        (event.status === 201 ||
          event.status === 204 ||
          event.status === 200) &&
        req.method !== 'GET'
      ) {
        const action = event.headers.get('X-Action')?.toTitleCase();
        let url = api[event.url?.split('/')[4]!];
        // console.log(event.url?.split('/')[4]!);
        let message;
        if (url) message = `${url} ${action?.toLowerCase()}d successfully`;
        else message = `${action}d successfully`;
        _messageService.success(message);
      }
      _loaderService.hideLoader();
    }),
    catchError((error: HttpErrorResponse) => {
      let errors: { field: string; message: string }[] = error.error.errors;
      let message = error.error.message;
      let errorMessage = '';

      if (errors) {
        errorMessage = errors.map((x) => x.message).join('<br>');
      }

      _notificationService.error(message, errorMessage);
      _loaderService.hideLoader();
      if (error.status === 401) {
        _authService.logout();
      }
      _loaderService.hideLoader();
      return throwError(errorMessage);
    })
  );
};
