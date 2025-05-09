import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  {
    path: 'basic-form',
    loadChildren: () =>
      import('./pages/basic-form/basic-form.routes').then(
        (m) => m.BASIC_FORM_ROUTES
      ),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./pages/users/users.routes').then((m) => m.USERS_ROUTES),
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.routes').then((m) => m.WELCOME_ROUTES),
  },
];
