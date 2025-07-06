import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
// biome-ignore lint/style/useImportType: <explanation>
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// biome-ignore lint/style/useImportType: <explanation>
import { ActivatedRoute } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { PageHeaderComponent } from '@components';
import { type LineItem, Product } from '@models';
// biome-ignore lint/style/useImportType: <explanation>
import {
  InventoryService,
  UnitService,
  ProductCategoryService,
  ProductService,
  StockService,
} from '@services';
import { watchObject } from '@utils';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzStepsModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzModalModule,
    NzCheckboxModule,
    NzDropDownModule,
    NzToolTipModule,
  ],
  templateUrl: './stock-form.component.html',
  styleUrl: './stock-form.component.css',
})
export class StockFormComponent {
  stockForm: FormGroup;
  productForm: FormGroup;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  products: any[] = [];
  config = {
    profitMgn: true,
  };
  info = {
    totalAmount: 0,
    totalQty: 0,
  };
  id = 'new';
  isEdit = false;

  defaultUnitId = '';
  defaultCategoryId = '';
  isAddProductModalVisible = false;

  formatter = (value: number) =>
    value ? value.toIndianCurrencyFormat() : '₹0.00';
  numberFormatter = (value: number) =>
    value ? value.toIndianNumberFormat() : '₹0.00';
  // only display 2 decimal points
  removeDecimal = (value: number) => `${Math.floor(value * 100) / 100}`;

  @HostListener('window:keydown', ['$event'])
  handleShortcut = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'i') {
      event.preventDefault();
      this.addLineItem();
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _unitService: UnitService,
    private _productCategoryService: ProductCategoryService,
    private _productService: ProductService,
    private _stockService: StockService,
    private _inventoryService: InventoryService
  ) {
    const config = JSON.parse(localStorage.getItem('config') || '{}');
    if (config) this.config = config;

    this.config = watchObject(this.config, (prop, value) => {
      this.setConfigToLocalStorage();
    });
    this._unitService.getAll().subscribe(({ data }) => {
      this.defaultUnitId = data.find((u) => u.code === 'NO')?.unitId ?? '';
    });
    this._productCategoryService.getAll().subscribe(({ data }) => {
      this.defaultCategoryId =
        data.find((c) => c.code === 'DEFAULT')?.categoryId ?? '';
    });
  }

  setConfigToLocalStorage() {
    localStorage.setItem('config', JSON.stringify(this.config));
  }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
    });

    this.stockForm = this.fb.group({
      invoiceNumber: [''],
      invoiceDate: [Date.now(), [Validators.required]],
      referenceNumber: [''],
      referenceDate: [null],
      lineItems: this.fb.array([]),
      totalQty: [0],
      totalAmount: [0],
      notes: [''],
    });
    this.addLineItem();

    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    this.id = this.route.snapshot.params['id'];
    if (this.id && this.id !== 'new') {
      this.isEdit = true;
    }

    this._productService.getAll().subscribe(({ data }) => {
      this.products = data;
      console.log('Products:', this.products);
    });
  }

  getUnit(productId: string) {
    const product = this.products.find((p) => p.productId === productId);
    // console.log('product', product);
    return product?.unit?.code ?? '';
  }

  getProductHSN(productId: string) {
    const product = this.products.find((p) => p.productId === productId);
    return product?.taxCode ? `- ${product.taxCode}` : '';
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  getGtnDetails(gtnNo: string, form: any) {
    if (gtnNo)
      this._inventoryService.searchGtn(gtnNo).subscribe((res) => {
        if (!this.products.find((p) => p.productId === res.product.productId)) {
          this.products.push({
            productId: res.product.productId,
            code: res.product.code,
            name: res.product.name,
            taxPct: res.product.taxPct ?? 0,
            unit: {
              unitId: res.unit.unitId,
              code: res.unit.code,
              name: res.unit.name,
            },
          });
        }
        form.controls.productId.setValue(res.product.productId);
        // form.controls['productId'].disable();
        form.controls.unitId.setValue(res.unit.unitId);
      });
  }

  get lineItems(): FormArray {
    return this.stockForm.get('lineItems') as FormArray;
  }

  addLineItem(): void {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const form: any = this.fb.group({
      productId: [null, Validators.required],
      unitId: ['', Validators.required],
      gtn: [''],
      qty: [1, Validators.required],
      rate: [0, Validators.required],
      price: [0, Validators.required],
      lineTotal: [0, Validators.required],
      marginPctOrAmt: ['pct', Validators.required],
      margin: [0, Validators.required],
      sellingPrice: [0, Validators.required],
    });

    const setValues = () => {
      const qty = form.controls.qty.value ?? 0;
      const rate = form.controls.rate.value ?? 0;
      form.controls.price.setValue(qty * rate);

      form.controls.lineTotal.setValue(qty * rate);
    };

    form.controls.productId.valueChanges.subscribe((productId: string) => {
      if (!productId) return;
      if (productId === 'new') {
        this.isAddProductModalVisible = true;
        return;
      }
      const product = this.products.find((p) => p.productId === productId);
      form.controls.unitId.setValue(product.unit?.unitId);
      form.controls.rate.setValue(product.sellingPrice ?? 0);
      form.controls.sellingPrice.setValue(product.sellingPrice ?? 0);
      form.controls.marginPctOrAmt.setValue(product.marginPct ? 'pct' : 'amt');
      form.controls.margin.setValue(
        product.marginPct
          ? product.marginPct
          : product.marginAmt
          ? product.marginAmt
          : 0
      );
    });

    const reCalculate = () => {
      setValues();
      this.calculateFooter();
    };

    for (const controlName of ['qty', 'rate']) {
      form.controls[controlName].valueChanges.subscribe(() => {
        reCalculate();
      });
    }

    form.controls.rate.valueChanges.subscribe(() => {
      reCalculate();
      this.calculateSellPrice(form);
    });

    for (const controlName of ['margin', 'marginPctOrAmt']) {
      form.controls[controlName].valueChanges.subscribe(() => {
        this.calculateSellPrice(form);
      });
    }

    this.lineItems.push(form);
    this.calculateFooter();
  }

  calculateFooter() {
    this.info.totalAmount = 0;
    this.info.totalQty = 0;
    for (const item of this.stockForm.value.lineItems as LineItem[]) {
      this.info.totalAmount += item.lineTotal;
      this.info.totalQty += item.qty;
    }

    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    this.stockForm.controls['totalAmount'].setValue(this.info.totalAmount);
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    this.stockForm.controls['totalQty'].setValue(this.info.totalQty);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  calculateSellPrice(form: any) {
    if (this.config.profitMgn) {
      const rate = form.controls.rate.value;
      const margin = form.controls.margin.value;
      if (form.controls.marginPctOrAmt.value === 'pct')
        form.controls.sellingPrice.setValue(rate + rate * (margin / 100));
      else form.controls.sellingPrice.setValue(rate + margin);
    } else {
      form.controls.sellingPrice.setValue(0);
    }
  }

  onProfitMarginChange() {
    for (const form of this.lineItems.controls as FormGroup[]) {
      this.calculateSellPrice(form);
    }
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
    this.calculateFooter();
  }

  submitForm(): void {
    if (this.stockForm.valid) {
      const value = this.stockForm.getRawValue();

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const addDiscountProfitField = (value: any) => {
        if (value.marginPctOrAmt === 'pct') {
          value.marginPct = value.margin;
          value.marginAmt = 0;
          // biome-ignore lint/performance/noDelete: <explanation>
          delete value.margin;
          // biome-ignore lint/performance/noDelete: <explanation>
          delete value.marginPctOrAmt;
        } else {
          value.marginAmt = value.margin;
          value.marginPct = 0;
          // biome-ignore lint/performance/noDelete: <explanation>
          delete value.margin;
          // biome-ignore lint/performance/noDelete: <explanation>
          delete value.marginPctOrAmt;
        }
      };
      for (const item of value.lineItems as LineItem[]) {
        addDiscountProfitField(item);
        if (item.gtn === '') item.gtn = 'tbd';
      }

      if (this.isEdit) {
        this._stockService.update(this.id, value).subscribe((res) => {
          console.log('Response:', res);
          this.stockForm.reset();
          this.lineItems.clear();
          this.addLineItem();
        });
      } else
        this._stockService.create(value).subscribe((res) => {
          console.log('Response:', res);
          this.stockForm.reset();
          this.lineItems.clear();
          this.addLineItem();
        });
    } else {
      console.log('Invalid Form', this.stockForm.value);
      this.stockForm.markAllAsTouched();

      for (const control of Object.values(this.stockForm.controls)) {
        if (control.invalid) {
          console.log('control', control);
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
        if (control instanceof FormArray) {
          for (const c of control.controls) {
            for (const innerControl of Object.values(
              (c as FormGroup).controls
            )) {
              if (innerControl.invalid) {
                console.log('innerControl', innerControl);
                innerControl.markAsDirty();
                innerControl.updateValueAndValidity({ onlySelf: true });
              }
            }
          }
        }
      }
    }
  }

  addProduct() {
    if (this.productForm.valid) {
      const newProduct = {
        ...this.productForm.value,
        productType: 'goods',
        taxPreference: 'taxable',
        unitId: this.defaultUnitId,
        categoryId: this.defaultCategoryId,
        taxPct: 5.0,
      };
      this._productService.create(newProduct).subscribe(({ data }) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const selectedLineItem: any = this.lineItems.controls.find(
          (x) => x.value.productId === 'new'
        );
        this.products.push(data);
        if (selectedLineItem)
          selectedLineItem.controls.productId.setValue(data.productId);
        this.isAddProductModalVisible = false;
        this.productForm.reset();
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }
}
