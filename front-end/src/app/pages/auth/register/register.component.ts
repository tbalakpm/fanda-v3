import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

type RegisterForm = FormGroup<{
  userName: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phone: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  validateForm: RegisterForm = this.fb.group({
    userName: ['', [Validators.required]],
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/),
      ],
    ],
  });

  constructor(private fb: NonNullableFormBuilder) {}

  getErrorMessage(controlName: string): string {
    const control = this.validateForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control?.hasError('required')) {
        return `${controlName.toTitleCase()} is required`;
      } else if (control?.hasError('minlength')) {
        return `${controlName.toTitleCase()} should be at least ${
          control.errors['minlength'].requiredLength
        } characters long`;
      } else if (control?.hasError('pattern')) {
        return 'Invalid input format';
      } else if (control?.hasError('email')) {
        return 'Invalid email';
      }
    }
    return '';
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
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
