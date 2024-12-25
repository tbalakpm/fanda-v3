import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Organization } from '../../../../models';
import {
  AuthService,
  LoaderService,
  OrganizationService,
} from '../../../../services';

import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { InfoDrawerComponent } from '../../../../components/info-drawer/info-drawer.component';
import { PageHeaderComponent } from '../../../../components/page-header/page-header.component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';

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

  organizations: Organization[] = [];
  selectedInfoOrganization: Organization = {} as Organization;

  selectedOrganization: Organization = {} as Organization;

  total: number;
  pageIndex = 1;
  pageSize = 10;
  sort = 'code';
  order = 'asc';
  _searchValue = '';

  get searchValue() {
    return this._searchValue;
  }
  set searchValue(value: string) {
    this._searchValue = value;
    this.fetchOrganizations();
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
  }

  fetchOrganizations() {
    this._orgService
      .getPaged({
        page: this.pageIndex,
        limit: this.pageSize,
        value: this.searchValue,
        sort: this.sort,
        order: this.order,
      })
      .subscribe({
        next: (orgs) => {
          this.total = orgs.total;
          this.organizations = orgs.items;
        },
      });
  }

  onQueryParamsChange(qp: NzTableQueryParams) {
    this.pageIndex = qp.pageIndex;
    this.pageSize = qp.pageSize;
    for (let i in qp.sort) {
      const sort = qp.sort[i];
      if (sort.value) {
        this.sort = sort.key;
        this.order = sort.value === 'ascend' ? 'asc' : 'desc';
        break;
      } else {
        this.sort = 'code';
        this.order = 'asc';
      }
    }
    this.fetchOrganizations();
  }

  openInfoDrawer(id: string) {
    this.selectedInfoOrganization = this.organizations.find(
      (org) => org._id === id
    )!;
    this.isInfoDrawerVisible = true;
  }

  deleteOrganization(id: string) {
    this._orgService.delete(id).subscribe({
      next: () => {
        this.organizations = this.organizations.filter((org) => org._id !== id);
        this._authService.isOrgChanged.emit();
      },
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this._orgService.activate(id).subscribe(() => {
        this.organizations.find((o) => o._id === id)!.isActive = true;
        this._authService.isOrgChanged.emit();
      });
    else
      this._orgService.deactivate(id).subscribe(() => {
        this.organizations.find((o) => o._id === id)!.isActive = false;
        this._authService.isOrgChanged.emit();
      });
  }
}
