import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { fadeInAnimation } from '@animations';
import { OrgYear, Organization } from '@models';
import {
  AuthService,
  LoaderService,
  LoginResponseData,
  OrganizationService,
} from '@services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzDropDownModule,
    NzSelectModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [fadeInAnimation],
})
export class HomeComponent implements OnInit {
  user: LoginResponseData;
  isLoading$;
  organizations: Organization[] = [];
  selectedOrganization: Organization;
  selectedYear: OrgYear;

  menus = [
    {
      level: 1,
      title: 'Transactions',
      icon: 'swap',
      open: true,
      selected: false,
      disabled: false,
      children: [
        {
          level: 2,
          selected: false,
          title: 'Sales',
          url: 'sales',
        },
        {
          level: 2,
          selected: false,
          title: 'Sales Return',
          url: 'sales-return',
        },
        {
          level: 2,
          selected: false,
          title: 'Purchase',
          url: 'purchase',
        },
        {
          level: 2,
          selected: false,
          title: 'Purchase Return',
          url: 'purchase-return',
        },
        {
          level: 2,
          selected: false,
          title: 'Stock',
          url: 'stock',
        },
      ],
    },
    {
      level: 1,
      title: 'Inventory',
      icon: 'product',
      open: false,
      selected: false,
      disabled: false,
      children: [
        {
          level: 2,
          selected: false,
          title: 'Products',
          url: 'products',
        },
        {
          level: 2,
          selected: false,
          title: 'Product Categories',
          url: 'product/category',
        },
        {
          level: 2,
          selected: false,
          title: 'Units',
          url: 'product/unit',
        },
      ],
    },
    {
      level: 1,
      title: 'People',
      icon: 'user',
      open: false,
      selected: false,
      disabled: false,
      children: [
        {
          level: 2,
          selected: false,
          title: 'Customers',
          url: 'party/customer',
        },
        {
          level: 2,
          selected: false,
          title: 'Suppliers',
          url: 'party/supplier',
        },
        {
          level: 2,
          selected: false,
          title: 'Users',
          url: 'user',
        },
      ],
    },
    {
      level: 1,
      title: 'Settings',
      icon: 'setting',
      open: false,
      selected: false,
      disabled: false,
      children: [
        {
          level: 2,
          selected: false,
          title: 'Organizations',
          url: 'organization/list',
        },
        {
          level: 2,
          selected: false,
          title: 'Options',
          url: '/Options',
        },
      ],
    },
    // {
    //   level: 1,
    //   title: 'Reports',
    //   icon: 'file',
    //   open: false,
    //   selected: false,
    //   disabled: false,
    //   url: '/reports',
    // },
  ];

  reportMenu = [
    {
      level: 1,
      title: 'Reports',
      icon: 'file',
      open: true,
      selected: false,
      disabled: false,
      children: [
        {
          level: 2,
          selected: false,
          title: 'Sales',
          url: 'reports/sales',
        },
        {
          level: 2,
          selected: false,
          title: 'Purchase',
          url: 'reports/purchase',
        },
        {
          level: 2,
          selected: false,
          title: 'Sales Return',
          url: 'reports/sales-return',
        },
        {
          level: 2,
          selected: false,
          title: 'Stock',
          url: 'reports/stock',
        },
      ],
    },
  ];

  private _isReportMenu = false;
  get isReportMenu(): boolean {
    return this._isReportMenu;
  }
  set isReportMenu(value: boolean) {
    this._isReportMenu = value;
    localStorage.setItem('isReportMenu', JSON.stringify(value));
  }

  constructor(
    protected auth: AuthService,
    private _orgService: OrganizationService,
    protected _loaderService: LoaderService
  ) {
    const isReportMenu = localStorage.getItem('isReportMenu');
    if (isReportMenu) {
      this.isReportMenu = JSON.parse(isReportMenu);
    } else {
      this.isReportMenu = false;
      localStorage.setItem('isReportMenu', JSON.stringify(this.isReportMenu));
    }
    this.isLoading$ = this._loaderService.isLoadingActive();

    this.auth.getUser().subscribe({
      next: (value) => {
        this.user = value;
      },
    });

    this.auth.getOrganization().subscribe({
      next: (value) => {
        if (value?.companyId) this.selectedOrganization = value;
      },
    });

    this.auth.getYear().subscribe({
      next: (value) => {
        if (value?.yearId) this.selectedYear = value;
      },
    });

    this.getOrganization();

    this.auth.isOrgChanged.subscribe({
      next: () => {
        this.getOrganization();
      },
    });

    if (!this.selectedOrganization && !this.selectedYear) {
      this.menus = [
        {
          level: 1,
          title: 'Settings',
          icon: 'setting',
          open: false,
          selected: false,
          disabled: false,
          children: [
            {
              level: 2,
              selected: true,
              title: 'Organizations',
              url: 'organization/add',
            },
          ],
        },
      ];
    }

    let url = window.location.pathname.split('/');

    let currentUrl = url[url.length - 1];
    if (url.includes('edit')) currentUrl = url[url.length - 3];
    if (url.includes('add')) currentUrl = url[url.length - 2];

    if (currentUrl)
      this.menus.forEach((menu) => {
        menu.open = false;
        menu.children?.forEach((child) => {
          if (child.url.includes(currentUrl)) {
            menu.open = true;
            child.selected = true;
            return;
          }
        });
      });
  }

  ngOnInit(): void {}

  getOrganization() {
    this._orgService.getAll({ filter: 'isActive:eq:true' }).subscribe({
      next: ({ data }) => {
        this.organizations = data;
      },
    });
  }

  switchOrganization(value: any): void {
    const organization = this.organizations.find((x) => x.companyId === value);
    sessionStorage.setItem('organization', JSON.stringify(organization));
    this.auth.setOrganization(organization!);
    window.location.reload();
  }

  switchYear(value: any): void {
    const selectedOrganizationYear = this.selectedOrganization.years.find(
      (x) => x.companyId === value
    );
    this.auth.setYear(selectedOrganizationYear!);
    window.location.reload();
  }

  menuClick(menu: any): void {
    this.menus.forEach((x) => {
      x.open = false;
    });
    menu.open = true;
  }
}
