import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ProductCategory } from '../../../../models';
import { LoaderService, ProductCategoryService } from '../../../../services';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@Component({
  selector: 'product-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzPopconfirmModule,
    NzIconModule,
    NzToolTipModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTagModule,
    NzSwitchModule,
  ],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.scss',
})
export class ProductCategoryComponent {
  productCategories: ProductCategory[] = [];

  editId: string | null = null;
  editData: ProductCategory = { isActive: true } as ProductCategory;

  total: number;
  pageIndex = 1;
  pageSize = 10;
  sort = 'code';
  order = 'asc';

  searchValue = '';
  debounce: any;

  onSearchChange = (value: string) => {
    this.searchValue = value;
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.getOrgProductCategories(), 300);
  };

  constructor(
    public _loaderService: LoaderService,
    private _productCategoryService: ProductCategoryService
  ) {}

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
    this.getOrgProductCategories();
  }

  getOrgProductCategories(): void {
    // this._loaderService.showLoader();
    this._productCategoryService
      .getPaged({
        page: 1,
        limit: 10,
        sort: this.sort,
        order: this.order,
        value: this.searchValue,
      })
      .subscribe({
        next: (data) => {
          this.productCategories = [...data.items];
          this.total = data.total;
          this._loaderService.hideLoader();
        },
      });
  }

  startEdit(id: string, setFocus: string): void {
    this.editId = id;
    this.editData = { ...this.productCategories.find((x) => x._id === id)! };
    setTimeout(() => {
      document.getElementById(setFocus + id)?.focus();
    });
  }

  cancelEdit(): void {
    if (this.editId === 'new') {
      this.productCategories = this.productCategories.filter(
        (x) => x._id !== 'new'
      );
    }
    this.editId = null;
    this.editData = { isActive: true } as ProductCategory;
  }

  saveEdit(): void {
    // this._loaderService.showLoader();
    this._productCategoryService.update(this.editId!, this.editData).subscribe({
      next: (data) => {
        this.editId = null;
        this.getOrgProductCategories();
      },
    });
  }

  addNewCategory() {
    this.editId = 'new';
    this.editData = { isActive: true } as ProductCategory;
    this.editData._id = 'new';
    this.productCategories = [this.editData, ...this.productCategories];
  }

  saveNewCategory() {
    // this._loaderService.showLoader();
    this._productCategoryService.create(this.editData).subscribe({
      next: (data) => {
        this.editId = null;
        this.getOrgProductCategories();
      },
    });
  }

  deleteCategory(id: string) {
    this._productCategoryService.delete(id).subscribe({
      next: () => {
        this.getOrgProductCategories();
      },
    });
  }

  toggleActive(id: string, active: boolean) {
    if (active)
      this._productCategoryService.activate(id).subscribe(() => {
        this.productCategories.find((p) => p._id === id)!.isActive = true;
      });
    else
      this._productCategoryService.deactivate(id).subscribe(() => {
        this.productCategories.find((p) => p._id === id)!.isActive = false;
      });
  }
}
