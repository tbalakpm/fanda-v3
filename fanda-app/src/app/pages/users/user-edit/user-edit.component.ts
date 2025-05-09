//#region Angular
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
  AbstractControl,
  AsyncValidatorFn,
} from '@angular/forms';
//#endregion

//#region Ng Zorro
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFlexModule } from 'ng-zorro-antd/flex';
//#endregion

//#region User
import { UserDataService } from '../user-data.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { User, UserExistsResponse, UserResponse } from '../user';
//#endregion

@Component({
  selector: 'app-user-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzFlexModule,
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css',
})
export class UserEditComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() userId!: string;
  @ViewChild('usernameField') usernameField!: ElementRef<HTMLElement>;
  @ViewChild('firstNameField') firstNameField!: ElementRef<HTMLElement>;

  private userSelectedSub$!: Subscription;
  private destroy$ = new Subject<void>();
  private userService = inject(UserService);
  private userDataService = inject(UserDataService);
  private formBuilder = inject(NonNullableFormBuilder);
  private usernameValidationTimeout: any;

  userEditForm = this.formBuilder.group(
    {
      username: [
        '',
        [
          Validators.required,
          // Validators.minLength(3),
          // Validators.maxLength(16),
          Validators.pattern(/^[a-z][a-z0-9-]{2,15}$/),
        ],
        [this.checkUsernameExists()],
      ],
      // password: ['', Validators.required],
      // confirm: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      firstName: [''],
      lastName: [''],
      role: ['user', [Validators.required]],
    }
    // { validators: [this.confirmValidator('password', 'confirm')] }
  );

  ngOnInit(): void {
    this.userSelectedSub$ = this.userDataService.UserSelected$.subscribe(
      (userId) => {
        this.userId = userId;

        if (this.userId) {
          console.log('UserId', userId);
          this.userService
            .getUser(this.userId)
            .then((response) => response.json())
            .then((user: UserResponse) => {
              console.log('User', user);

              this.userEditForm.patchValue(user.data!);
              this.userEditForm.controls.username.disable();
              this.firstNameField.nativeElement.focus();
            });
        } else {
          console.log('Subscribing from ngOnInit()');
          this.resetForm();
        }
      }
    );

    // this.userEditForm.controls['password'].valueChanges
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     this.userEditForm.controls['confirm'].updateValueAndValidity();
    //   });
  }

  ngAfterViewInit(): void {
    this.usernameField.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.userSelectedSub$?.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  resetForm(e?: MouseEvent) {
    if (e) e.preventDefault();
    this.userId = '';
    // this.userDataService.selectUser('');
    this.userEditForm.controls.username.enable();
    this.userEditForm.reset();
    try {
      this.usernameField.nativeElement.focus();
    } catch {}
  }

  onSubmit() {
    if (!this.userEditForm.valid) {
      return;
    }

    const data: any = this.userEditForm.value;
    if (this.userId) {
      // Update
      this.userService
        .updateUser(this.userId, data as User)
        .then((response) => response.json())
        .then((result) => {
          this.resetForm();
          // reload users list
          this.userDataService.loadUsers();
        });
    } else {
      // Create
      data['password'] = 'Welcome@123';

      this.userService
        .createUser(data as User)
        .then((response) => response.json())
        .then((result) => {
          this.resetForm();
          // reload users list
          this.userDataService.loadUsers();
        });
    }
  }

  checkUsernameExists(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ duplicated: boolean } | null> => {
      // Return null for empty values (valid by default)
      if (!control.value || this.userId) {
        return of(null);
      }

      if (this.usernameValidationTimeout) {
        clearTimeout(this.usernameValidationTimeout);
        this.usernameValidationTimeout = null;
      }

      return new Observable<{ duplicated: boolean } | null>((observer) => {
        this.usernameValidationTimeout = setTimeout(() => {
          this.userService
            .checkExists(control.value, '')
            .then((response) => response.json())
            .then((res: UserExistsResponse) => {
              observer.next(
                res.data?.usernameExists ? { duplicated: true } : null
              );
              observer.complete();
            })
            .catch(() => {
              observer.next(null);
              observer.complete();
            });
        }, 1000);
      });
    };
  }

  // confirmValidator(
  //   controlName: string,
  //   matchingControlName: string
  // ): ValidatorFn {
  //   return (abstractControl: AbstractControl) => {
  //     const control = abstractControl.get(controlName);
  //     const matchingControl = abstractControl.get(matchingControlName);

  //     if (!matchingControl!.value) {
  //       matchingControl?.setErrors({ error: true, required: true });
  //       return { error: true, required: true };
  //     } else if (control!.value !== matchingControl!.value) {
  //       matchingControl?.setErrors({ error: true, confirm: true });
  //       return { confirm: true, error: true };
  //     } else {
  //       matchingControl?.setErrors(null);
  //       return {};
  //     }
  //   };
  // }

  // confirmValidator(form: FormGroup): ValidationErrors | null {
  //   if (!form.controls['confirm'].value) {
  //     form.controls['confirm'].setErrors({
  //       error: true,
  //       required: true,
  //     });
  //     return { error: true, required: true };
  //   } else if (
  //     form.controls['confirm'].value !== form.controls['password'].value
  //   ) {
  //     form.controls['confirm'].setErrors({
  //       confirm: true,
  //       error: true,
  //     });
  //     return { confirm: true, error: true };
  //   } else {
  //     form.controls['confirm'].setErrors(null);
  //     return {};
  //   }
  // }
}
