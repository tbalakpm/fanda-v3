import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ProductCategory } from '@models';
import { LoaderService, ProductCategoryService } from '@services';

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
  styleUrl: './product-category.component.css',
})
export class ProductCategoryComponent {
  productCategories: ProductCategory[] = [];

  editId: string | null = null;
  editData: ProductCategory = { isActive: true } as ProductCategory;

  total: number;

  constructor(
    public _loaderService: LoaderService,
    private _productCategoryService: ProductCategoryService
  ) {
    this.getOrgProductCategories();
  }

  getOrgProductCategories(): void {
    // this._loaderService.showLoader();
    this._productCategoryService.getAll().subscribe({
      next: ({ data, total }) => {
        this.productCategories = [...data];
        this.total = total;
        this._loaderService.hideLoader();
      },
    });
  }

  startEdit(id: string, setFocus: string): void {
    this.editId = id;
    this.editData = {
      ...this.productCategories.find((x) => x.categoryId === id)!,
    };
    setTimeout(() => {
      document.getElementById(setFocus + id)?.focus();
    });
  }

  cancelEdit(): void {
    if (this.editId === 'new') {
      this.productCategories = this.productCategories.filter(
        (x) => x.categoryId !== 'new'
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
    this.editData.categoryId = 'new';
    this.productCategories = [this.editData, ...this.productCategories];
  }

  saveNewCategory() {
    // this._loaderService.showLoader();
    this.editData.categoryId = undefined;
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
        this.productCategories.find((p) => p.categoryId === id)!.isActive =
          true;
      });
    else
      this._productCategoryService.deactivate(id).subscribe(() => {
        this.productCategories.find((p) => p.categoryId === id)!.isActive =
          false;
      });
  }
}
