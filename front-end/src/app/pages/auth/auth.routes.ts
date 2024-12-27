import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BaseComponent } from './base/base.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: BaseComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
];
