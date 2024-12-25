import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { Router, RouterModule } from '@angular/router';
import {
  AuthService,
  Login,
  LoginResponseData,
} from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService,
    private route: Router
  ) {}

  validateForm: FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      let user: Login = {
        username: this.validateForm.value.username!,
        password: this.validateForm.value.password!,
      };
      this.auth.login(user).subscribe({
        next: ({ data, token }) => {
          this.auth.setUser({ ...data, token });
          this.route.navigateByUrl('/home/select-organization');
        },
      });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
