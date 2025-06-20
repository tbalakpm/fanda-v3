import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'org-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule],
  templateUrl: './org-user-form.component.html',
  styleUrl: './org-user-form.component.scss',
})
export class OrgUserFormComponent {
  @Input() orgUserForm: FormGroup;
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
}
