import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  Consumer,
  GTN,
  InwardInvoice,
  Organization,
  OutwardInvoice,
  Party,
  Product,
  ProductCategory,
  Response,
  Stock,
  Unit,
  User,
} from '@models';
import { AuthService } from './auth.service';

interface PagedResponse<T> {
  total: number;
  data: T[];
}

export interface QueryOptions {
  page?: number;
  size?: number;
  sort?: string; // <field>:<direction = asc|desc>
  filter?: string; // <field>:<operator = eq|neq|gt|gte|lt|lte|in|nin|isnull|isnotnull>:<value>
  search?: string; // search string
  // order?: string;
  // value?: string | boolean | number;
  // field?: string;
  // invoiceType?: string;
}

function queryOptions(options: any) {
  if (!options) return '';
  let string = '?';
  Object.keys(options).forEach((key, id, s) => {
    if (s.length == id) string += `${key}=${options[key]}`;
    else string += `${key}=${options[key]}&`;
  });
  return string;
}

abstract class GenericService<T> {
  httpClient: HttpClient;
  baseUrl = environment.ICMS_API_URL;
  module: string;
  auth = inject(AuthService);
  orgId: string;
  yearId: string;
  private _apiUrl: string;

  constructor(httpClient: HttpClient, module: string) {
    this.auth.getOrganization().subscribe({
      next: (value) => {
        if (value?.companyId) this.orgId = value.companyId;
      },
    });

    this.auth.getYear().subscribe({
      next: (value) => {
        if (value?.yearId) this.yearId = value.yearId;
      },
    });

    this.httpClient = httpClient;
    this.module = module;
  }

  protected get moduleUrl() {
    return `/${this.module}`;
  }
  protected get orgApiUrl() {
    return `/companies/${this.orgId}`;
  }
  protected get yearApiUrl() {
    return `/years/${this.yearId}`;
  }
  protected setApiUrl(apiUrl: string) {
    this._apiUrl = apiUrl;
  }
  public get apiUrl() {
    return this._apiUrl;
  }

  public getAll(options?: QueryOptions): Observable<Response<T[]>> {
    return this.httpClient.get<Response<T[]>>(
      `${this.baseUrl}${this.apiUrl}${queryOptions(options)}`
    );
  }
  public getPaged(options: QueryOptions): Observable<PagedResponse<T>> {
    return this.httpClient.get<PagedResponse<T>>(
      `${this.baseUrl}${this.apiUrl}${queryOptions(options)}`
    );
  }
  public getById(id: string): Observable<Response<T>> {
    return this.httpClient.get<Response<T>>(
      `${this.baseUrl}${this.apiUrl}/${id}`
    );
  }
  public create(resource: Partial<T>): Observable<Response<T>> {
    return this.httpClient.post<Response<T>>(
      `${this.baseUrl}${this.apiUrl}`,
      resource
    );
  }
  public update(id: string, resource: Partial<T>): Observable<Response<T>> {
    return this.httpClient.put<Response<T>>(
      `${this.baseUrl}${this.apiUrl}/${id}`,
      resource
    );
  }
  public delete(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}${this.apiUrl}/${id}`);
  }

  public activate(id: string): Observable<Response<T>> {
    return this.httpClient.patch<Response<T>>(
      `${this.baseUrl}/activate/${this.module}`,
      {
        id,
        activeFlag: true,
      }
    );
  }
  public deactivate(id: string): Observable<Response<T>> {
    return this.httpClient.patch<Response<T>>(
      `${this.baseUrl}/activate/${this.module}`,
      {
        id,
        activeFlag: false,
      }
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UserService extends GenericService<User> {
  constructor(private http: HttpClient) {
    super(http, 'users');
    this.setApiUrl(this.moduleUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class OrganizationService extends GenericService<Organization> {
  constructor(private http: HttpClient) {
    super(http, 'companies');
    this.setApiUrl(this.moduleUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class UnitService extends GenericService<Unit> {
  constructor(private http: HttpClient) {
    super(http, 'units');
    this.setApiUrl(this.orgApiUrl + this.moduleUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class ProductCategoryService extends GenericService<ProductCategory> {
  constructor(private http: HttpClient) {
    super(http, 'product-categories');
    this.setApiUrl(this.orgApiUrl + this.moduleUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class ProductService extends GenericService<Product> {
  constructor(private http: HttpClient) {
    super(http, 'products');
    this.setApiUrl(this.orgApiUrl + this.moduleUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class CustomerService extends GenericService<Party> {
  constructor(private http: HttpClient) {
    super(http, 'customers');
    this.setApiUrl(this.orgApiUrl + this.moduleUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class SupplierService extends GenericService<Party> {
  constructor(private http: HttpClient) {
    super(http, 'suppliers');
    this.setApiUrl(this.orgApiUrl + this.moduleUrl);
  }
}

// INWARD INVOICE SERVICES - Purchase, Sales Return
@Injectable({ providedIn: 'root' })
export class InwardInvoiceService extends GenericService<InwardInvoice> {
  constructor(private http: HttpClient) {
    super(http, 'purchases');
    this.setApiUrl(this.orgApiUrl + this.yearApiUrl + this.moduleUrl);
  }
}
@Injectable({ providedIn: 'root' })
export class PurchaseInvoiceService extends GenericService<InwardInvoice> {
  constructor(private http: HttpClient) {
    super(http, 'purchases');
    this.setApiUrl(this.orgApiUrl + this.yearApiUrl + this.moduleUrl);
  }
}
@Injectable({ providedIn: 'root' })
export class SalesReturnInvoiceService extends GenericService<InwardInvoice> {
  constructor(private http: HttpClient) {
    super(http, 'sales-returns');
    this.setApiUrl(this.orgApiUrl + this.yearApiUrl + this.moduleUrl);
  }
}

// OUTWARD INVOICE SERVICES - Sales, Purchase Return
@Injectable({ providedIn: 'root' })
export class OutwardInvoiceService extends GenericService<OutwardInvoice> {
  constructor(private http: HttpClient) {
    super(http, 'outward-invoices');
    this.setApiUrl(this.orgApiUrl + this.yearApiUrl + this.moduleUrl);
  }
}
@Injectable({ providedIn: 'root' })
export class SalesInvoiceService extends GenericService<OutwardInvoice> {
  constructor(private http: HttpClient) {
    super(http, 'sales');
    this.setApiUrl(this.orgApiUrl + this.yearApiUrl + this.moduleUrl);
  }
}
@Injectable({ providedIn: 'root' })
export class PurchaseReturnInvoiceService extends GenericService<OutwardInvoice> {
  constructor(private http: HttpClient) {
    super(http, 'purchase-returns');
    this.setApiUrl(this.orgApiUrl + this.yearApiUrl + this.moduleUrl);
  }
}

// STOCK INVOICE SERVICES - Stock, Transfer
@Injectable({ providedIn: 'root' })
export class StockService extends GenericService<Stock> {
  constructor(private http: HttpClient) {
    super(http, 'stock-invoices');
    this.setApiUrl(this.orgApiUrl + this.yearApiUrl + this.moduleUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class ConsumerService extends GenericService<Consumer> {
  constructor(private http: HttpClient) {
    super(http, 'consumers');
    this.setApiUrl(this.orgApiUrl + this.moduleUrl);
  }
}

@Injectable({ providedIn: 'root' })
export class YearService extends GenericService<Consumer> {
  constructor(private http: HttpClient) {
    super(http, 'financial-years');
    this.setApiUrl(this.orgApiUrl + this.moduleUrl);
  }
}
@Injectable({ providedIn: 'root' })
export class InventoryService extends GenericService<GTN> {
  constructor(private http: HttpClient) {
    super(http, 'inventories');
  }

  searchGtn(gtn: string): Observable<GTN> {
    return this.http
      .get<any>(`${this.baseUrl}${this.orgApiUrl}${this.moduleUrl}/gtn/${gtn}`)
      .pipe(map((res) => res.data));
  }
}
