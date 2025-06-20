import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'organization-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule],
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.scss',
})
export class OrganizationFormComponent {
  @Input() organizationForm: FormGroup;
  @Output() submit: EventEmitter<void> = new EventEmitter<void>();
}
