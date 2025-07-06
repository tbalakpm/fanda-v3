import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, forkJoin } from 'rxjs';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { fadeInAnimation } from '@animations';
import { PageHeaderComponent } from '@components';
import { ProductFormComponent } from '@forms';
import { Product, ProductCategory, Response, Unit } from '@models';
import {
  LoaderService,
  ProductCategoryService,
  ProductService,
  UnitService,
} from '@services';

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
  styleUrl: './product-add.component.css',
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
        next: ({ data }) => {
          this.productForm.patchValue(data);
          this.productForm.controls['categoryId'].setValue(
            data.category?.categoryId
          );
          this.productForm.controls['baseUnitId'].setValue(data.unit?.unitId);
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
      productId: [null],
      isActive: [true],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      productType: ['goods', [Validators.required]],
      buyingPrice: 0,
      marginPctOrAmt: 'pct',
      margin: 0,
      sellingPrice: 0,
      taxPreference: [null, [Validators.required]],
      taxCode: [''],
      taxPct: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      categoryId: [null, [Validators.required]],
      baseUnitId: [null, [Validators.required]],
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

    this.productForm.controls['baseUnitId'].valueChanges.subscribe((val) => {
      if (val === 'new') {
        this.isUnitModelVisible = true;
        this.productForm.controls['baseUnitId'].reset();
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
      delete product.productId;
      this._productService.create(product).subscribe({
        next: (res) => {
          this.router.navigate(['/home/products']);
        },
      });
    } else
      this._productService.update(this.id!, product).subscribe({
        next: (res) => {
          this.router.navigate(['/home/products']);
        },
      });
  }

  saveCategory(): void {
    if (this.productCategoryForm.invalid) {
      this.validateForm(this.productCategoryForm.controls);
      return;
    }

    let category: ProductCategory = this.productCategoryForm.value;

    this._categoryService.create(category).subscribe({
      next: (res) => {
        console.log(res);
        this._loaderService.hideLoader();
        this.categories.push(res.data);
        this.isCategoryModelVisible = false;
        this.productForm.controls['categoryId'].setValue(res.data.categoryId);
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
        this.productForm.controls['unitId'].setValue(res.data.unitId);
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
