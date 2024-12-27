import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { GetCities, STATES } from '@constants';

@Component({
  selector: 'party-address-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
  ],
  templateUrl: './party-address-form.component.html',
  styleUrl: './party-address-form.component.scss',
})
export class PartyAddressFormComponent implements OnInit {
  isCustomer: boolean;
  @Input() partyAddressForm: FormGroup;
  @Output() submit: EventEmitter<void> = new EventEmitter<void>();

  states = STATES;
  cities: string[] = [];

  constructor(private router: Router) {
    this.isCustomer = this.router.url.includes('customer');
  }

  ngOnInit() {
    this.getCities();
    this.partyAddressForm.controls['state'].valueChanges.subscribe(() => {
      this.partyAddressForm.controls['city'].setValue('');
      this.getCities();
    });
  }

  getCities() {
    this.cities = GetCities(this.partyAddressForm.controls['state'].value);
  }

  onStateSearch(search: string) {
    let states = STATES.filter((state) =>
      state.toLowerCase().includes(search.toLowerCase())
    );
    if (states.length == 0) {
      this.states.pop();
      this.states.push(search);
    }
  }

  onCitySearch(search: string) {
    if (!search) {
      return;
    }
    let cities = this.cities?.filter((city) =>
      city.toLowerCase().includes(search.toLowerCase())
    );
    if (cities.length == 0) {
      this.cities.pop();
      this.cities.push(search);
    }
  }
}
