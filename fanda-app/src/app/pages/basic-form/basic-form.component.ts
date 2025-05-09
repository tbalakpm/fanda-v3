import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormRecord,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'advanced-search-form',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
  ],
  templateUrl: './basic-form.component.html',
  styleUrls: ['./basic-form.component.css'],
})
export class BasicFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  validateForm: FormRecord<FormControl<string>> = this.fb.record({});
  controlArray: Array<{ index: number; show: boolean }> = [];
  isCollapse = true;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
    this.controlArray.forEach((c, index) => {
      c.show = this.isCollapse ? index < 6 : true;
    });
  }

  resetForm(): void {
    this.validateForm.reset();
  }

  ngOnInit(): void {
    for (let i = 0; i < 10; i++) {
      this.controlArray.push({ index: i, show: i < 6 });
      this.validateForm.addControl(`field${i}`, this.fb.control(''));
    }
  }
}
