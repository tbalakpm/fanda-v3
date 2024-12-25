import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';

import { ProductFormComponent } from '../../../../forms/product-form/product-form.component';
import {
  LoaderService,
  ProductCategoryService,
  ProductService,
  UnitService,
} from '../../../../services';

import { Product, ProductCategory, Unit, Response } from '../../../../models';
import { fadeInAnimation } from '../../../../animations';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../components/page-header/page-header.component';

@Component({
  selector: 'product-add',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ProductFormComponent,

    CommonModule,
    ReactiveFormsModule,

    NzButtonModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
  ],
  templateUrl: './product-add.component.html',
  styleUrl: './product-add.component.scss',
  animations: [fadeInAnimation],
})
export class ProductAddComponent {
  productForm: FormGroup;
  productCategoryForm: FormGroup;
  unitForm: FormGroup;

  isCategoryModelVisible = false;
  categories: ProductCategory[] = [];
  isUnitModelVisible = false;
  units: Unit[] = [];
  isEdit = false;

  private _id: string = 'new';
  get id() {
    return this._id;
  }

  set id(val: string) {
    this._id = val;
    if (val && val !== 'new') {
      this.isEdit = true;
      this._productService.getById(val).subscribe({
        next: (res) => {
          this.productForm.patchValue(res);
          this.productForm.controls['categoryId'].setValue(
            res.data.category?._id
          );
          this.productForm.controls['unitId'].setValue(res.data.unit?._id);
          console.log(this.productForm.value);
        },
      });
    } else this.isEdit = false;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _productService: ProductService,
    private _loaderService: LoaderService,
    private _categoryService: ProductCategoryService,
    private _unitService: UnitService
  ) {
    this.productForm = this.fb.group({
      _id: [null],
      isActive: [true],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      type: ['goods', [Validators.required]],
      buyingPrice: 0,
      marginPctOrAmt: 'pct',
      margin: 0,
      sellingPrice: 0,
      taxPreference: [null, [Validators.required]],
      taxCode: [null],
      taxPct: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      categoryId: [null, [Validators.required]],
      unitId: [null, [Validators.required]],
    });

    this.productCategoryForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
    });

    this.unitForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
    });

    this.productForm.controls['taxPreference'].valueChanges.subscribe((val) => {
      if (val === 'nontaxable' || val === 'exempt') {
        this.productForm.controls['taxPct'].setValue(0);
        this.productForm.controls['taxPct'].clearValidators();
      } else {
        this.productForm.controls['taxPct'].setValidators([
          Validators.required,
          Validators.min(1),
        ]);
      }
      this.productForm.controls['taxPct'].updateValueAndValidity();
    });

    this.productForm.controls['categoryId'].valueChanges.subscribe((val) => {
      if (val === 'new') {
        this.isCategoryModelVisible = true;
        this.productForm.controls['categoryId'].reset();
      }
    });

    this.productForm.controls['unitId'].valueChanges.subscribe((val) => {
      if (val === 'new') {
        this.isUnitModelVisible = true;
        this.productForm.controls['unitId'].reset();
      }
    });

    this.id = this.route.snapshot.params['id'];

    let requests: {
      categories: Observable<Response<ProductCategory[]>>;
      units: Observable<Response<Unit[]>>;
      product?: Observable<Response<Product>>;
    } = {
      categories: this._categoryService.getAll(),
      units: this._unitService.getAll(),
    };

    _loaderService.showLoader();
    forkJoin(requests).subscribe((res) => {
      this.categories = res.categories.data;
      this.units = res.units.data;
      _loaderService.hideLoader();
    });
  }

  save(): void {
    if (this.productForm.invalid) {
      this.validateForm(this.productForm.controls);
      return;
    }

    let product: Product = this.productForm.value;
    if (product.marginPctOrAmt === 'pct') {
      product['marginPct'] = product.margin;
      product['marginAmt'] = 0;
      delete product.margin;
      delete product.marginPctOrAmt;
    } else {
      product['marginAmt'] = product.margin;
      product['marginPct'] = 0;
      delete product.margin;
      delete product.marginPctOrAmt;
    }

    if (!this.isEdit) {
      delete product._id;
      this._productService.create(product).subscribe({
        next: (res) => {
          this.router.navigate(['/home/product']);
        },
      });
    } else
      this._productService.update(this.id!, product).subscribe({
        next: (res) => {
          this.router.navigate(['/home/product']);
        },
      });
  }

  saveCategory(): void {
    if (this.productCategoryForm.invalid) {
      this.validateForm(this.productCategoryForm.controls);
      return;
    }

    let category: ProductCategory = this.productCategoryForm.value;
    // this._loaderService.showLoader();

    this._categoryService.create(category).subscribe({
      next: (res) => {
        console.log(res);
        this._loaderService.hideLoader();
        this.categories.push(res.data);
        this.isCategoryModelVisible = false;
        this.productForm.controls['categoryId'].setValue(res.data._id);
      },
    });
  }

  closeCategoryModel(): void {
    this.isCategoryModelVisible = false;
    this.productCategoryForm.reset();
  }

  saveUnit(): void {
    if (this.unitForm.invalid) {
      this.validateForm(this.unitForm.controls);
      return;
    }

    let unit: Unit = this.unitForm.value;
    // this._loaderService.showLoader();

    this._unitService.create(unit).subscribe({
      next: (res) => {
        console.log(res);
        this._loaderService.hideLoader();
        this.units.push(res.data);
        this.isUnitModelVisible = false;
        this.productForm.controls['unitId'].setValue(res.data._id);
      },
    });
  }

  closeUnitModel(): void {
    this.isUnitModelVisible = false;
    this.unitForm.reset();
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
