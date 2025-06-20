import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideLottieOptions } from 'ngx-lottie';

import { AuthInterceptor, ErrorInterceptor } from '@interceptors';
import { ThemeService } from '@services';

import { routes } from './app.routes';
import { provideNzIcons } from './icons-provider';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNzIcons(),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([ErrorInterceptor, AuthInterceptor])),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    ThemeService,
  ],
};
