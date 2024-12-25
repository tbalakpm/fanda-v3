import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import {
  CustomerService,
  LoaderService,
  SupplierService,
} from '../../../../services';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { Party } from '../../../../models';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { PartyAddressFormComponent } from '../../../../forms/party-address-form/party-address-form.component';
import { PartyContactFormComponent } from '../../../../forms/party-contact-form/party-contact-form.component';
import { PartyFormComponent } from '../../../../forms/party-form/party-form.component';
import { fadeInAnimation } from '../../../../animations';
import { PageHeaderComponent } from '../../../../components/page-header/page-header.component';

@Component({
  selector: 'organization-add',
  standalone: true,
  imports: [
    PageHeaderComponent,
    PartyFormComponent,
    PartyAddressFormComponent,
    PartyContactFormComponent,

    CommonModule,
    RouterModule,

    NzButtonModule,
    NzStepsModule,
    NzIconModule,
  ],
  templateUrl: './party-add.component.html',
  styleUrl: './party-add.component.scss',
  animations: [fadeInAnimation],
})
export class PartyAddComponent {
  isCustomer: boolean;
  current = 0;

  partyForm: FormGroup;
  partyAddressForm: FormGroup;
  partyContactForm: FormGroup;
  // orgUserForm: FormGroup;

  id: string | null = null;
  isEdit = false;

  constructor(
    private router: Router,
    public _loaderService: LoaderService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _customerService: CustomerService,
    private _supplierService: SupplierService
  ) {
    this.isCustomer = this.router.url.includes('customer');
    this.partyForm = this.fb.group({
      _id: [null],
      code: [null, [Validators.required]],
      name: [null, [Validators.required]],
      gstTreatment: [null, [Validators.required]],
      gstin: [null],
    });
    // this.orgUserForm = this.fb.group({
    //   email: [null, [Validators.required, Validators.email]],
    //   password: 'F2Gn9LxI5JU0eJZ@123',
    // });
    this.partyAddressForm = this.fb.group({
      _id: [null],
      line1: [null],
      line2: [null],
      area: [null],
      city: [null],
      state: [null],
      postalCode: [null],
    });
    this.partyContactForm = this.fb.group({
      _id: [null],
      salutation: [null],
      firstName: [null],
      lastName: [null],
      mobile: [null, [Validators.minLength(10)]],
      email: [null, [Validators.email]],
    });

    this.id = this.route.snapshot.params['id'];
    if (!!this.id) {
      this.isEdit = true;
      // this._loaderService.showLoader();
      let request = this.isCustomer
        ? this._customerService.getById(this.id)
        : this._supplierService.getById(this.id);

      request.subscribe(({ data }) => {
        this.partyForm.patchValue(data);
        if (data.address) this.partyAddressForm.patchValue(data.address);
        if (data.billingAddress)
          this.partyAddressForm.patchValue(data.billingAddress);
        if (data.contact) this.partyContactForm.patchValue(data.contact);
        this.partyForm.controls['code'].disable();
      });
    }
  }

  pre(): void {
    this.current -= 1;
  }

  next(): void {
    if (this.current === 0 && this.partyForm.invalid) {
      this.validateForm(this.partyForm.controls);
      return;
    } else if (this.current === 1 && this.partyAddressForm.invalid) {
      this.validateForm(this.partyAddressForm.controls);
      return;
    } else if (this.current === 2 && this.partyContactForm.invalid) {
      this.validateForm(this.partyContactForm.controls);
      return;
    }
    this.current += 1;
  }

  done(): void {
    if (this.current === 2 && this.partyContactForm.invalid) {
      this.validateForm(this.partyContactForm.controls);
      return;
    }

    let party: Party = {
      ...this.partyForm.value,
      address: this.partyAddressForm.value,
      contact: this.partyContactForm.value,
    };
    // let orgUser = this.orgUserForm.value;

    // this._loaderService.showLoader();

    let request = this.isCustomer
      ? this._customerService.create(party)
      : this._supplierService.create(party);

    if (this.isEdit)
      request = this.isCustomer
        ? this._customerService.update(this.id!, party)
        : this._supplierService.update(this.id!, party);

    request.subscribe({
      next: (res) => {
        this.current += 1;
      },
      error: (err) => {
        this.current = 0;
      },
    });
  }

  validateForm(controls: any) {
    Object.values(controls).forEach((control: any) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
