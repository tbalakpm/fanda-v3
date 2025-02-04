import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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

import { LineItem } from '@models';
import { InventoryService, ProductService, StockService } from '@services';
import { watchObject } from '@utils';
import { PageHeaderComponent } from '@components';

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
  styleUrl: './stock-form.component.scss',
})
export class StockFormComponent {
  stockForm: FormGroup;
  productForm: FormGroup;
  products: any[] = [];
  config = {
    profitMgn: true,
  };
  info = {
    totalAmount: 0,
    totalQty: 0,
  };
  id: string = 'new';
  isEdit = false;

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
    private _productService: ProductService,
    private _stockService: StockService,
    private _inventoryService: InventoryService
  ) {
    let config = JSON.parse(localStorage.getItem('config') || '{}');
    if (config) this.config = config;

    this.config = watchObject(this.config, (prop, value) => {
      this.setConfigToLocalStorage();
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
    return product?.taxCode ? '- ' + product.taxCode : '';
  }

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
        form.controls['productId'].setValue(res.product.productId);
        // form.controls['productId'].disable();
        form.controls['unitId'].setValue(res.unit.unitId);
      });
  }

  get lineItems(): FormArray {
    return this.stockForm.get('lineItems') as FormArray;
  }

  addLineItem(): void {
    let form: any = this.fb.group({
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
      const product = this.products.find((p) => p.productId === productId)!;
      form.controls.unitId.setValue(product.unit!.unitId!);
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

    ['qty', 'rate'].forEach((controlName) => {
      form.controls[controlName].valueChanges.subscribe(() => {
        reCalculate();
      });
    });

    form.controls.rate.valueChanges.subscribe(() => {
      reCalculate();
      this.calculateSellPrice(form);
    });

    ['margin', 'marginPctOrAmt'].forEach((controlName) => {
      form.controls[controlName].valueChanges.subscribe((value: number) => {
        this.calculateSellPrice(form);
      });
    });

    this.lineItems.push(form);
    this.calculateFooter();
  }

  calculateFooter() {
    this.info.totalAmount = 0;
    this.info.totalQty = 0;
    this.stockForm.value.lineItems.forEach((item: LineItem) => {
      this.info.totalAmount += item.lineTotal;
      this.info.totalQty += item.qty;
    });

    this.stockForm.controls['totalAmount'].setValue(this.info.totalAmount);
    this.stockForm.controls['totalQty'].setValue(this.info.totalQty);
  }

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
    this.lineItems.controls.forEach((form: any) => {
      this.calculateSellPrice(form);
    });
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
    this.calculateFooter();
  }

  submitForm(): void {
    if (this.stockForm.valid) {
      let value = this.stockForm.getRawValue();

      const addDiscountProfitField = (value: any) => {
        if (value.marginPctOrAmt === 'pct') {
          value['marginPct'] = value.margin;
          value['marginAmt'] = 0;
          delete value.margin;
          delete value.marginPctOrAmt;
        } else {
          value['marginAmt'] = value.margin;
          value['marginPct'] = 0;
          delete value.margin;
          delete value.marginPctOrAmt;
        }
      };
      value.lineItems.forEach((item: LineItem) => {
        addDiscountProfitField(item);
        if (item.gtn === '') item.gtn = 'tbd';
      });

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

      Object.values(this.stockForm.controls).forEach((control: any) => {
        if (control.invalid) {
          console.log('control', control);
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
        if (control instanceof FormArray) {
          control.controls.forEach((c: any) => {
            Object.values(c.controls).forEach((innerControl: any) => {
              if (innerControl.invalid) {
                console.log('innerControl', innerControl);
                innerControl.markAsDirty();
                innerControl.updateValueAndValidity({ onlySelf: true });
              }
            });
          });
        }
      });
    }
  }

  addProduct() {
    if (this.productForm.valid) {
      const newProduct = {
        ...this.productForm.value,
        productType: 'goods',
        taxPreference: 'taxable',
        taxPct: 5.0,
      };
      this._productService.create(newProduct).subscribe(({ data }) => {
        let selectedLineItem: any = this.lineItems.controls.find(
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
