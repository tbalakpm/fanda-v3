import { FocusMonitor } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { Form, Option } from '@models';

@Component({
  selector: 'f-form',
  standalone: true,
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
  ],
})
export class FormComponent implements OnInit {
  @Input()
  form: Form[];

  @Output('onSubmit')
  submit = new EventEmitter();

  checked = true;

  onCheckChange(e: any) {
    console.log(e);
  }

  formGroup: FormGroup = this.fb.group({});

  isOpen: any = {};

  focusMonitor = inject(FocusMonitor);

  @ViewChildren('multiSelectItems')
  private multiSelectItemsRef: QueryList<ElementRef>;

  focusedOption = 0;

  public onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        event.stopPropagation();
        this.focusMonitor.focusVia(
          this.focusedOption === 0
            ? this.multiSelectItemsRef.last.nativeElement
            : this.multiSelectItemsRef.get(--this.focusedOption)?.nativeElement,
          'keyboard'
        );
        break;
      case 'ArrowDown':
        event.stopPropagation();
        this.focusMonitor.focusVia(
          this.focusedOption === this.multiSelectItemsRef.length - 1
            ? this.multiSelectItemsRef.first?.nativeElement
            : this.multiSelectItemsRef.get(++this.focusedOption)?.nativeElement,
          'keyboard'
        );
        break;
    }
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form.forEach((f) => {
      if (f.controlType === 'select') {
        this.isOpen[f.formControlName] = false;
      }
      let validatorsToAdd: any = [];
      for (const [key, value] of Object.entries(f.config)) {
        switch (key) {
          case 'min':
            validatorsToAdd.push(Validators.min(value));
            break;
          case 'max':
            validatorsToAdd.push(Validators.max(value));
            break;
          case 'required':
            if (value) validatorsToAdd.push(Validators.required);
            break;
          case 'email':
            if (value) validatorsToAdd.push(Validators.email);
            break;
          case 'minLength':
            validatorsToAdd.push(Validators.minLength(value));
            break;
          case 'maxLength':
            validatorsToAdd.push(Validators.maxLength(value));
            break;
          case 'pattern':
            validatorsToAdd.push(Validators.pattern(value));
            break;
          default:
            break;
        }
      }
      let control = new FormControl(f.value, validatorsToAdd);
      this.formGroup.addControl(f.formControlName, control);
    });
    console.log(this.form);
  }

  getSelectLabel(formControlName: string, options: Option[]) {
    return options.find(
      (o) => o.value === this.formGroup.value[formControlName]
    )?.label;
  }

  getErrorMessage(error: any, label: string) {
    return error.required
      ? `${label} is required`
      : error.email
      ? `${label} is not valid`
      : error.minlength
      ? `${label} must be at least ${error.minlength.requiredLength} characters long`
      : error.maxlength
      ? `${label} must be at most ${error.maxlength.requiredLength} characters long`
      : error.min
      ? `${label} must be at least ${error.min.min} characters long`
      : error.max
      ? `${label} must be at most ${error.max.max} characters long`
      : error.pattern
      ? `${label} is not valid`
      : '';
  }

  getListOfSelectedValues(options: Option[], value: any[]): Option[] {
    return options.filter((option) => value.includes(option.value));
  }

  getMultiSelectTags(formControlName: string, tags: any[]): Option[] {
    let value = this.formGroup.controls[formControlName].value;
    return tags.filter((tag: any) => value.includes(tag.value));
  }

  getMultiSelectOptions(tags: any[], search: string): Option[] {
    let test = new RegExp(search, 'i');
    return tags.filter((tag: any) => test.test(tag.label));
  }

  onMultiSelectClick(item: Option, formControlName: string) {
    let value = this.formGroup.controls[formControlName].value;
    if (value.includes(item.value)) {
      value = value.filter((v: any) => v !== item.value);
    } else {
      value.push(item.value);
    }
    this.formGroup.controls[formControlName].setValue(value);
  }

  onMultiSelectTagRemove(tag: any, formControlName: string) {
    let value = this.formGroup.controls[formControlName].value;
    value = value.filter((v: any) => v !== tag.value);
    this.formGroup.controls[formControlName].setValue(value);
  }

  onSubmit() {
    console.log('Form values: ', this.formGroup.value);
    if (this.formGroup.invalid) {
      Object.values(this.formGroup.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      console.log('Form: ', this.formGroup.errors);
      return;
    }
  }
}
