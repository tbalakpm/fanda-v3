import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
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
import { NzSelectModule } from 'ng-zorro-antd/select';

import { User } from '@models';
import { LoaderService, UserService } from '@services';

@Component({
  selector: 'user-add',
  standalone: true,
  imports: [
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    RouterModule,
    NzSelectModule,
  ],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.css',
})
export class UserAddComponent {
  userForm: FormGroup;

  @Output() formSubmit: EventEmitter<void> = new EventEmitter<void>();

  private _id: string = 'new';
  get id() {
    return this._id;
  }
  @Input('id')
  set id(val: string) {
    console.log(val);
    this._id = val;
    if (val && val !== 'new') {
      this.isEdit = true;
      this.userForm.controls['username'].disable();
      this._userService.getById(val).subscribe({
        next: ({ data }) => {
          this.userForm.patchValue(data);
          console.log(data);
        },
      });
    } else this.isEdit = false;
  }
  isEdit = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private _loaderService: LoaderService,
    private _userService: UserService
  ) {
    this.userForm = this.fb.group({
      userId: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.minLength(3)]],
      lastName: ['', [Validators.minLength(3)]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],
      role: [null, [Validators.required]],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (control && control?.errors) {
      if (
        control.hasValidator(Validators.required) &&
        control.errors['required']
      ) {
        return `${controlName.toTitleCase()} is required`;
      } else if (
        control.hasValidator(Validators.minLength(3)) &&
        control.errors['minlength']
      ) {
        return `${controlName.toTitleCase()} should be at least ${
          control.errors['minlength'].requiredLength
        } characters long`;
      } else if (
        control.hasValidator(Validators.pattern(/^\d{10}$/)) &&
        control.errors['pattern']
      ) {
        return 'Invalid input format';
      } else if (
        control.hasValidator(Validators.email) &&
        control.errors['email']
      ) {
        return 'Invalid email';
      }
    }
    return '';
  }

  submitForm(): void {
    if (this.userForm.valid) {
      let user: Partial<User> = this.userForm.value;

      // this._loaderService.showLoader();
      if (!this.isEdit) {
        delete user.userId;
        this._userService.create(user).subscribe({
          next: (res) => {
            console.log(res);
            this._loaderService.hideLoader();
            this.userForm.reset();
            this.id = 'new';
            this.formSubmit.emit();
          },
        });
      } else
        this._userService.update(this.id!, user).subscribe({
          next: (res) => {
            console.log(res);
            this._loaderService.hideLoader();
            this.userForm.reset();
            this.userForm.controls['username'].enable();
            this.id = 'new';
            this.formSubmit.emit();
          },
        });
    } else {
      Object.values(this.userForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
