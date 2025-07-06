import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { PageHeaderComponent } from '@components';
import { TAX_TYPES_DICT } from '@constants';
import { Product } from '@models';
import { LoaderService, ProductService } from '@services';

import { productColumns } from './product-list';

@Component({
  selector: 'product-list',
  standalone: true,
  imports: [
    PageHeaderComponent,

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
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  private _products: Product[] = [];
  get products(): Product[] {
    return this._products.filter(
      (p) =>
        p.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        p.code.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        p.category?.name
          .toLowerCase()
          .includes(this.searchValue.toLowerCase()) ||
        p.unit?.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        p.buyingPrice.toString().includes(this.searchValue.toLowerCase()) ||
        p.sellingPrice.toString().includes(this.searchValue.toLowerCase())
    );
  }
  set products(value: Product[]) {
    this._products = value;
  }

  taxTypes = TAX_TYPES_DICT;

  total: number;
  _searchValue = '';
  productColumns = productColumns;

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
  ) {
    this.fetchProducts();
  }

  fetchProducts() {
    this._productService.getAll().subscribe(({ data, total }) => {
      this.products = [...data];
      this.total = total;
    });
  }

  deleteProduct(id: string) {
    this._productService.delete(id).subscribe(() => {
      this.fetchProducts();
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this._productService.activate(id).subscribe(() => {
        this.products.find((p) => p.productId === id)!.isActive = true;
      });
    else
      this._productService.deactivate(id).subscribe(() => {
        this.products.find((p) => p.productId === id)!.isActive = false;
      });
  }
}
