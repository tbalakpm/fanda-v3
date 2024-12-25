import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ProductService } from './../../../../services/api.service';
import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Product } from '../../../../models';
import { CommonModule } from '@angular/common';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { LoaderService } from '../../../../services';
// import { ProductAddComponent } from '../product-add/product-add.component';
import { TAX_TYPES_DICT } from '../../../../constants';
import { PageHeaderComponent } from '../../../../components/page-header/page-header.component';
import { FormsModule } from '@angular/forms';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'product-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    // ProductAddComponent,

    CommonModule,
    RouterModule,
    FormsModule,

    NzIconModule,
    NzButtonModule,
    NzTableModule,
    NzTagModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzSwitchModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  products: Product[] = [];
  taxTypes = TAX_TYPES_DICT;

  editId: string = 'new';

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
    this.fetchProducts();
  }

  constructor(
    public _loaderService: LoaderService,
    private _productService: ProductService
  ) {}

  fetchProducts() {
    this.editId = 'new';
    // this._loaderService.showLoader();
    this._productService
      .getPaged({
        page: this.pageIndex,
        limit: this.pageSize,
        sort: this.sort,
        order: this.order,
        value: this.searchValue,
      })
      .subscribe((products) => {
        this.products = [...products.items];
        this.total = products.total;
        this._loaderService.hideLoader();
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
    this.fetchProducts();
  }

  deleteProduct(id: string) {
    this._productService.delete(id).subscribe(() => {
      this.fetchProducts();
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this._productService.activate(id).subscribe(() => {
        this.products.find((p) => p._id === id)!.isActive = true;
      });
    else
      this._productService.deactivate(id).subscribe(() => {
        this.products.find((p) => p._id === id)!.isActive = false;
      });
  }
}
