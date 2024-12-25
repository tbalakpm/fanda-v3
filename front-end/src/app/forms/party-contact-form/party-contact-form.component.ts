import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'party-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule],
  templateUrl: './party-contact-form.component.html',
  styleUrl: './party-contact-form.component.scss',
})
export class PartyContactFormComponent {
  isCustomer: boolean;
  @Input() partyContactForm: FormGroup;
  @Output() submit: EventEmitter<void> = new EventEmitter<void>();
  constructor(private router: Router) {
    this.isCustomer = this.router.url.includes('customer');
  }
}
