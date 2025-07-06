import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'org-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule],
  templateUrl: './org-contact-form.component.html',
  styleUrl: './org-contact-form.component.css',
})
export class OrgContactFormComponent {
  @Input() orgContactForm: FormGroup;
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
}
