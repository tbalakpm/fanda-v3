import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { InfoDrawerComponent, PageHeaderComponent } from '@components';
import { Organization } from '@models';
import { AuthService, LoaderService, OrganizationService } from '@services';

import { orgColumns } from './org-list';

@Component({
  selector: 'organization-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    PageHeaderComponent,
    InfoDrawerComponent,

    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzToolTipModule,
    NzDrawerModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzSwitchModule,
  ],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.scss',
})
export class OrganizationListComponent implements OnInit {
  isInfoDrawerVisible = false;

  private _organizations: Organization[] = [];
  selectedInfoOrganization: Organization = {} as Organization;

  selectedOrganization: Organization = {} as Organization;

  orgColumns = orgColumns;
  total: number;
  searchValue = '';

  get organizations() {
    return this._organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        org.code.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        org.description?.toLowerCase().includes(this.searchValue.toLowerCase())
    );
  }
  set organizations(value: Organization[]) {
    this._organizations = value;
  }

  constructor(
    public _loaderService: LoaderService,
    private _orgService: OrganizationService,
    public _authService: AuthService
  ) {}

  ngOnInit() {
    this._authService.getOrganization().subscribe((org) => {
      this.selectedOrganization = org;
    });
    this.fetchOrganizations();
  }

  fetchOrganizations() {
    this._orgService.getAll().subscribe({
      next: (orgs) => {
        this.total = orgs.total;
        this.organizations = [...orgs.data];
      },
    });
  }

  openInfoDrawer(id: string) {
    this.selectedInfoOrganization = this.organizations.find(
      (org) => org.companyId === id
    )!;
    this.isInfoDrawerVisible = true;
  }

  deleteOrganization(id: string) {
    this._orgService.delete(id).subscribe({
      next: () => {
        this.organizations = this.organizations.filter(
          (org) => org.companyId !== id
        );
        this._authService.isOrgChanged.emit();
      },
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this._orgService.activate(id).subscribe(() => {
        this.organizations.find((o) => o.companyId === id)!.isActive = true;
        this._authService.isOrgChanged.emit();
      });
    else
      this._orgService.deactivate(id).subscribe(() => {
        this.organizations.find((o) => o.companyId === id)!.isActive = false;
        this._authService.isOrgChanged.emit();
      });
  }
}
