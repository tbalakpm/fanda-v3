import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'org-address-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule],
  templateUrl: './org-address-form.component.html',
  styleUrl: './org-address-form.component.scss',
})
export class OrgAddressFormComponent {
  @Input() orgAddressForm: FormGroup;
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
}
