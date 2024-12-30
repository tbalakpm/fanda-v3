import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { fadeInAnimation } from '@animations';
import { PageHeaderComponent } from '@components';
import {
  CustomerService,
  LoaderService,
  SupplierService,
} from '../../../../services';
import { PartyAddressFormComponent } from '../../../../forms/party-address-form/party-address-form.component';
import { PartyContactFormComponent } from '../../../../forms/party-contact-form/party-contact-form.component';
import { PartyFormComponent } from '../../../../forms/party-form/party-form.component';
import { Party } from '../../../../models';

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
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      gstTreatment: ['', [Validators.required]],
      gstin: [''],
    });
    if (this.isCustomer) {
      this.partyForm.addControl('customerId', this.fb.control(null));
    } else {
      this.partyForm.addControl('supplierId', this.fb.control(null));
    }
    this.partyAddressForm = this.fb.group({
      line1: [''],
      line2: [''],
      city: [''],
      state: [''],
      postalCode: [''],
    });
    this.partyContactForm = this.fb.group({
      salutation: [''],
      firstName: [''],
      lastName: [''],
      mobile: ['', [Validators.minLength(10)]],
      email: ['', [Validators.email]],
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
        // if (data.billingAddress)
        //   this.partyAddressForm.patchValue(data.billingAddress);
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
