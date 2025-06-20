import { ProductListComponent } from './product/product-list/product-list.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { OrganizationAddComponent } from './organization/organization-add/organization-add.component';
import { OrganizationListComponent } from './organization/organization-list/organization-list.component';
import { ProductCategoryComponent } from './product/product-category/product-category.component';
import { UnitComponent } from './product/unit/unit.component';
import { ProductAddComponent } from './product/product-add/product-add.component';
import { PartyListComponent } from './party/party-list/party-list.component';
import { SelectOrganizationComponent } from './organization/select-organization/select-organization.component';
import { PartyAddComponent } from './party/party-add/party-add.component';
import { RegisterComponent } from '../auth/register/register.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { UserAddComponent } from './user/user-add/user-add.component';
import { PurchaseComponent } from './transactions/purchase/purchase.component';
import { PurchaseFormComponent } from '../../forms/purchase-form/purchase-form.component';
import { SalesReturnComponent } from './transactions/sales-return/sales-return.component';
import { SalesReturnFormComponent } from '../../forms/sales-return-form/sales-return-form.component';
import { inject } from '@angular/core';
import { AuthService } from '../../services';
import { SalesComponent } from './transactions/sales/sales.component';
import { SalesFormComponent } from '../../forms/sales-form/sales-form.component';
import { PurchaseReturnComponent } from './transactions/purchase-return/purchase-return.component';
import { PurchaseReturnFormComponent } from '../../forms/purchase-return-form/purchase-return-form.component';
import { StockComponent } from './transactions/stock/stock.component';
import { StockFormComponent } from '../../forms/stock-form/stock-form.component';
import { ReportsComponent } from './reports/reports.component';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'organization',
        children: [
          {
            path: 'add',
            component: OrganizationAddComponent,
          },
          {
            path: 'edit/:id',
            component: OrganizationAddComponent,
            canActivate: [() => inject(AuthService).isOrgSelected()],
          },
          {
            path: 'list',
            component: OrganizationListComponent,
            canActivate: [() => inject(AuthService).isOrgSelected()],
          },
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'product',
        children: [
          {
            path: 'category',
            component: ProductCategoryComponent,
          },
          {
            path: 'unit',
            component: UnitComponent,
          },
        ],
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'products',
        children: [
          {
            path: 'add',
            component: ProductAddComponent,
          },
          {
            path: 'edit/:id',
            component: ProductAddComponent,
          },
          {
            path: '',
            component: ProductListComponent,
          },
        ],
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'party',
        children: [
          {
            path: 'customer',
            children: [
              {
                path: '',
                component: PartyListComponent,
              },
              {
                path: 'add',
                component: PartyAddComponent,
              },
              {
                path: 'edit/:id',
                component: PartyAddComponent,
              },
            ],
          },
          {
            path: 'supplier',
            children: [
              {
                path: '',
                component: PartyListComponent,
              },
              {
                path: 'add',
                component: PartyAddComponent,
              },
              {
                path: 'edit/:id',
                component: PartyAddComponent,
              },
              {
                path: '',
                redirectTo: '',
                pathMatch: 'full',
              },
            ],
          },
        ],
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'user',
        component: UserListComponent,
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'purchase',
        children: [
          {
            path: '',
            component: PurchaseComponent,
          },
          {
            path: 'add',
            component: PurchaseFormComponent,
          },
          {
            path: 'edit/:id',
            component: PurchaseFormComponent,
          },
        ],
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'sales-return',
        children: [
          {
            path: '',
            component: SalesReturnComponent,
          },
          {
            path: 'add',
            component: SalesReturnFormComponent,
          },
          {
            path: 'edit/:id',
            component: SalesReturnFormComponent,
          },
        ],
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'sales',
        children: [
          {
            path: '',
            component: SalesComponent,
          },
          {
            path: 'add',
            component: SalesFormComponent,
          },
          {
            path: 'edit/:id',
            component: SalesFormComponent,
          },
        ],
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'purchase-return',
        children: [
          {
            path: '',
            component: PurchaseReturnComponent,
          },
          {
            path: 'add',
            component: PurchaseReturnFormComponent,
          },
          {
            path: 'edit/:id',
            component: PurchaseReturnFormComponent,
          },
        ],
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'stock',
        children: [
          {
            path: '',
            component: StockComponent,
          },
          {
            path: 'add',
            component: StockFormComponent,
          },
          {
            path: 'edit/:id',
            component: StockFormComponent,
          },
        ],
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: 'reports/:type',
        component: ReportsComponent,
        canActivate: [() => inject(AuthService).isOrgSelected()],
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'select-organization',
    component: SelectOrganizationComponent,
  },
];
