import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import {
  OrgAddressFormComponent,
  OrganizationFormComponent,
  OrgContactFormComponent,
} from '@forms';

import { AuthService, LoaderService, OrganizationService } from '@services';

import { fadeInAnimation } from '@animations';
import { PageHeaderComponent } from '@components';
import { Organization } from '@models';

@Component({
  selector: 'organization-add',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    PageHeaderComponent,
    OrganizationFormComponent,
    OrgAddressFormComponent,
    OrgContactFormComponent,
    // OrgUserFormComponent,

    NzButtonModule,
    NzStepsModule,
    NzIconModule,
  ],
  templateUrl: './organization-add.component.html',
  styleUrl: './organization-add.component.scss',
  animations: [fadeInAnimation],
})
export class OrganizationAddComponent {
  current = 0;

  organizationForm: FormGroup;
  orgAddressForm: FormGroup;
  orgContactForm: FormGroup;
  // orgUserForm: FormGroup;

  id: string | null = null;
  isEdit = false;

  constructor(
    public _loaderService: LoaderService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _orgService: OrganizationService,
    private _authService: AuthService,
    public router: Router
  ) {
    this.organizationForm = this.fb.group({
      companyId: [null],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      regdNum: [''],
      pan: [''],
      tan: [''],
      gstin: [''],
      isActive: true,
    });
    // this.orgUserForm = this.fb.group({
    //   email: ["", [Validators.required, Validators.email]],
    //   password: 'F2Gn9LxI5JU0eJZ@123',
    // });
    this.orgAddressForm = this.fb.group({
      line1: [''],
      line2: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      // not available
      attention: [''],
      phone: [''],
      fax: [''],
      email: [''],
      website: [''],
      isActive: true,
    });
    this.orgContactForm = this.fb.group({
      salutation: [''],
      firstName: [''],
      lastName: [''],
      mobile: [''],
      email: [''],
      // not available
      title: [''],
      workPhone: [''],
      isActive: true,
    });

    this.id = this.route.snapshot.params['id'];
    if (!!this.id) {
      this.isEdit = true;
      // this._loaderService.showLoader();
      this._orgService.getById(this.id).subscribe(({ data }) => {
        this.organizationForm.patchValue(data);
        if (data.address) this.orgAddressForm.patchValue(data.address);
        if (data.contact) this.orgContactForm.patchValue(data.contact);
        this._loaderService.hideLoader();
      });
    }
  }

  pre(): void {
    this.current -= 1;
  }

  next(): void {
    if (this.current === 0 && this.organizationForm.invalid) {
      this.validateForm(this.organizationForm.controls);
      return;
    } else if (this.current === 1 && this.orgAddressForm.invalid) {
      this.validateForm(this.orgAddressForm.controls);
      return;
    } else if (this.current === 2 && this.orgContactForm.invalid) {
      this.validateForm(this.orgContactForm.controls);
      return;
    }
    this.current += 1;
  }

  done(): void {
    if (this.current === 2 && this.orgContactForm.invalid) {
      this.validateForm(this.orgContactForm.controls);
      return;
    }

    let organization: Organization = {
      ...this.organizationForm.value,
      address: this.orgAddressForm.value,
      contact: this.orgContactForm.value,
    };
    // let orgUser = this.orgUserForm.value;

    // this._loaderService.showLoader();

    let request = this._orgService.update(this.id!, organization);

    if (!this.isEdit) request = this._orgService.create(organization);

    request.subscribe({
      next: ({ data }) => {
        if (!this._authService.isOrgSelected()) {
          this._authService.setOrganization(data);
        }
        this.current += 1;
        this._loaderService.hideLoader();
        this._authService.isOrgChanged.emit();
      },
      error: (err) => {
        this._loaderService.hideLoader();
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
