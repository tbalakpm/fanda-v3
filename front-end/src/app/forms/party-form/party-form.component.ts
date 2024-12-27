import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { GST_TREATMENTS_IN, GST_TREATMENTS_OUT } from '@constants';

@Component({
  selector: 'party-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
  ],
  templateUrl: './party-form.component.html',
  styleUrl: './party-form.component.scss',
})
export class PartyFormComponent {
  @Input() partyForm: FormGroup;
  @Output() submit: EventEmitter<void> = new EventEmitter<void>();
  isCustomer: boolean;

  gstTreatments: any;
  constructor(private router: Router) {
    this.isCustomer = this.router.url.includes('customer');
    if (this.isCustomer) {
      this.gstTreatments = GST_TREATMENTS_OUT;
    } else {
      this.gstTreatments = GST_TREATMENTS_IN;
    }
  }
}
