import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { forkJoin } from 'rxjs';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';

import { PageHeaderComponent } from '@components';
import { INVOICE_TYPES, INVOICE_TYPES_DICT } from '@constants';
import { LineItem, Party, Product } from '@models';
import {
  InventoryService,
  InwardInvoiceService,
  ProductService,
  SupplierService,
} from '@services';
import { watchObject } from '@utils';

@Component({
  selector: 'inward-invoice-add',
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
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTableModule,
    NzDropDownModule,
    NzRadioModule,
    NzModalModule,
    NzCheckboxModule,
    NzPopconfirmModule,
  ],
  templateUrl: './inward-invoice-add.component.html',
  styleUrl: './inward-invoice-add.component.css',
})
export class InwardInvoiceAddComponent {
  @Input()
  invoiceType: 'purchase' | 'salesreturn';

  inwardInvoiceForm: FormGroup;
  productForm: FormGroup;

  suppliers: Party[] = [];
  products: any[] = [];
  gtnProducts: any[] = [];

  invoiceTypesDict = INVOICE_TYPES_DICT;
  invoiceTypes = INVOICE_TYPES;

  formatter = (value: number) =>
    value ? value.toIndianCurrencyFormat() : '₹0.00';
  numberFormatter = (value: number) =>
    value ? value.toIndianNumberFormat() : '₹0.00';

  // only display 2 decimal points
  removeDecimal = (value: number) => `${Math.floor(value * 100) / 100}`;

  config = {
    discountLevel: 'transaction',
    profitMgn: true,
  };
  info = {
    subtotal: 0,
    totalQty: 0,
    discount: 0,
    taxAmount: 0,
    totalPrice: 0,
  };

  id: string = 'new';
  isEdit = false;

  isAddProductModalVisible = false;

  lookupFound: any = {};
  isTagNoNotFoundModalVisible = false;

  tagNotFoundForm: FormGroup = this.fb.group({
    gtn: ['', Validators.required],
    productId: ['', Validators.required],
    rate: [0, Validators.required],
    qty: [1, [Validators.required, Validators.min(1)]],
  });
  editingLineItem: number = -1;

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
    private _inwardInvoiceService: InwardInvoiceService,
    private _supplierService: SupplierService,
    private _productService: ProductService,
    private _inventoryService: InventoryService
  ) {
    let config = JSON.parse(localStorage.getItem('config') || '{}');
    if (config) this.config = config;

    this.config = watchObject(this.config, (prop, value) => {
      localStorage.setItem('config', JSON.stringify(this.config));
    });
  }

  ngOnInit(): void {
    this.config.discountLevel = 'transaction';
    if (this.invoiceType === 'salesreturn') this.config.profitMgn = false;

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
    });

    this.inwardInvoiceForm = this.fb.group({
      invoiceNumber: [''],
      invoiceDate: [Date.now(), [Validators.required]],
      referenceNumber: [''],
      referenceDate: [null],
      supplier: [null, [Validators.required]],
      invoiceType: [this.invoiceType, [Validators.required]],
      lineItems: this.fb.array([]),
      subtotal: [0],
      totalQty: [0],
      disPctOrAmt: ['pct', Validators.required],
      discount: [0, Validators.required],
      totalTaxAmt: [0, Validators.required],
      roundOff: [0],
      netAmount: [0],
      notes: [''],
      terms: [''],
    });
    this.addLineItem();

    ['disPctOrAmt', 'discount'].forEach((controlName) => {
      this.inwardInvoiceForm.controls[controlName].valueChanges.subscribe(
        () => {
          if (this.config.discountLevel === 'transaction') {
            this.calculateFooter();
          }
        }
      );
    });

    this.id = this.route.snapshot.params['id'];

    let requests: any = [
      this._supplierService.getAll({ filter: 'isActive:eq:true' }),
      this._productService.getAll({ filter: 'isActive:eq:true' }),
    ];
    if (this.id && this.id !== 'new') {
      requests.push(this._inwardInvoiceService.getById(this.id));
      this.isEdit = true;
      this.inwardInvoiceForm.disable();
    }

    forkJoin(requests).subscribe((res: any) => {
      this.suppliers = res[0];
      this.products = res[1];
      if (this.id === 'new') return;
      this.inwardInvoiceForm.patchValue(res[2]);
    });
  }

  getUnit(productId: string) {
    const product = this.products?.find((p) => p._id === productId);
    return product?.unit?.code ?? '';
  }

  getProductTax(id: string) {
    const product = this.products?.find((p) => p._id === id);
    return product?.taxPct ?? 0;
  }

  getProductName(productId: string) {
    const product = this.products?.find((p) => p._id === productId);
    return product?.name ?? '';
  }

  getProductHSN(productId: string) {
    const product = this.products?.find((p) => p._id === productId);
    return product?.taxCode ? '- ' + product.taxCode : '';
  }

  getGtnDetails(gtn: string, form: any) {
    if (!gtn) return;
    this._inventoryService.searchGtn(gtn).subscribe(
      (res) => {
        if (!this.gtnProducts.find((p) => p.gtn === res.gtn)) {
          this.gtnProducts.push({
            _id: res.product.productId,
            code: res.product.code,
            gtn: res.gtn,
            name: res.product.name,
            taxPct: res.product.taxPct ?? 0,
            taxCode: res.product.taxCode ?? '',
            sellingPrice: res.sellingPrice,
            buyingPrice: res.buyingPrice,
            unit: {
              _id: res.unit.unitId,
              code: res.unit.code,
              name: res.unit.name,
            },
          });
        }
        form.controls['productId'].setValue(res.product.productId);
        form.controls['unitId'].setValue(res.unit.unitId);
      },
      (err) => {
        this.lookupFound = {};
        setTimeout(() => {
          this.lookupFound[this.editingLineItem] = false;
        }, 100);
      }
    );
  }

  getProductPrice(productId: string) {
    let product: Product = this.products.find((p) => p._id === productId);
    if (
      this.invoiceType === 'salesreturn' &&
      this.lookupFound[this.editingLineItem]
    ) {
      product = this.gtnProducts.find((p) => p.gtn === productId);
    }

    if (product.sellingPrice && product.sellingPrice > 0)
      return product.sellingPrice;
    if (product.marginPct && product.buyingPrice && product.marginPct > 0)
      return (
        product.buyingPrice + (product.buyingPrice * product.marginPct) / 100
      );
    if (product.marginAmt && product.buyingPrice && product.marginAmt > 0)
      return product.buyingPrice + product.marginAmt;
    return 0;
  }

  get lineItems(): FormArray {
    return this.inwardInvoiceForm.get('lineItems') as FormArray;
  }

  addLineItem(): void {
    let form: any = this.fb.group({
      productId: [null, Validators.required],
      unitId: ['', Validators.required],
      gtn:
        this.invoiceType === 'salesreturn'
          ? ['', Validators.required]
          : [{ value: 'tbd', disabled: true }],
      qty: [1, Validators.required],
      rate: [0, Validators.required],
      price: [0, Validators.required],
      disPctOrAmt: ['pct', Validators.required],
      discount: [0, Validators.required],
      marginPctOrAmt: ['pct', Validators.required],
      margin: [0, Validators.required],
      taxPct: [0, Validators.required],
      taxAmt: [0, Validators.required],
      lineTotal: [0, Validators.required],
    });

    if (this.invoiceType === 'purchase') {
      form.addControl('sellingPrice', new FormControl(0, Validators.required));
    }

    const setDiscount = () => {
      const qty = form.controls.qty.value ?? 0;
      const rate = form.controls.rate.value ?? 0;
      const discount = form.controls.discount.value ?? 0;

      let product: Product = this.products.find(
        (p) => p._id === form.controls.productId.value
      );
      if (
        this.invoiceType === 'salesreturn' &&
        this.lookupFound[this.editingLineItem]
      )
        product = this.gtnProducts.find(
          (p) => p.gtn === form.controls.gtn.value
        );

      form.controls.price.setValue(qty * rate);
      const price = form.controls.price.value;

      let lineTotal = 0;
      if (this.config.discountLevel === 'item')
        if (form.controls.disPctOrAmt.value === 'pct')
          lineTotal = price - price * (discount / 100);
        else lineTotal = price - discount;
      else lineTotal = qty * rate;

      if (product?.taxPct) {
        const taxAmt = (lineTotal * product.taxPct) / 100;
        lineTotal += taxAmt;
        form.controls.taxAmt.setValue(taxAmt);
      }

      form.controls.lineTotal.setValue(lineTotal);
      form.controls.taxPct.setValue(product?.taxPct ?? 0);
    };

    const reCalculate = () => {
      setDiscount();
      this.calculateFooter();
    };

    form.controls.productId.valueChanges.subscribe((productId: string) => {
      if (!productId) return;
      if (productId === 'new') {
        this.isAddProductModalVisible = true;
        return;
      }
      let productGtn = form.value.gtn;

      let product: Product = this.products.find((p) => p._id === productId);
      if (
        this.invoiceType === 'salesreturn' &&
        this.lookupFound[this.editingLineItem]
      )
        product = this.gtnProducts.find((p) => p.gtn === productGtn);

      form.controls.unitId.setValue(product.unit!.unitId!);

      form.controls.marginPctOrAmt.setValue('pct');
      form.controls.margin.setValue(product.marginPct ?? 0);

      if (
        this.invoiceType === 'purchase' ||
        !this.lookupFound[this.editingLineItem]
      )
        form.controls.rate.setValue(this.getProductPrice(productId));
      else if (
        this.invoiceType === 'salesreturn' &&
        this.lookupFound[this.editingLineItem]
      )
        form.controls.rate.setValue(this.getProductPrice(productGtn));
    });

    ['qty', 'disPctOrAmt', 'discount'].forEach((controlName) => {
      form.controls[controlName].valueChanges.subscribe(() => {
        reCalculate();
      });
    });

    form.controls.rate.valueChanges.subscribe(() => {
      reCalculate();
      this.reCalculateSellPrice(form);
    });

    ['margin', 'marginPctOrAmt'].forEach((controlName) => {
      form.controls[controlName].valueChanges.subscribe((value: number) => {
        this.reCalculateSellPrice(form);
      });
    });

    this.lookupFound[this.lineItems.length] = true;
    this.lineItems.push(form);
    this.calculateFooter();
  }

  calculateFooter() {
    this.info.subtotal = 0;
    this.info.totalQty = 0;
    this.info.taxAmount = 0;
    this.info.discount = 0;
    this.info.totalPrice = 0;
    this.inwardInvoiceForm.value.lineItems.forEach((item: LineItem) => {
      this.info.subtotal += item.price;
      this.info.totalQty += item.qty;
      this.info.taxAmount += item.taxAmt ? item.taxAmt : 0;
      this.info.totalPrice += item.price;
      if (
        this.config.discountLevel === 'item' &&
        item.disPctOrAmt &&
        item.discount
      ) {
        if (item.disPctOrAmt === 'pct')
          this.info.discount += item.price * (item.discount / 100);
        else this.info.discount += item.discount;
      }
    });

    this.inwardInvoiceForm.controls['subtotal'].setValue(this.info.subtotal);
    this.inwardInvoiceForm.controls['totalQty'].setValue(this.info.totalQty);

    if (this.config.discountLevel === 'transaction') {
      const subtotal = this.inwardInvoiceForm.controls['subtotal'].value ?? 0;
      const discount = this.inwardInvoiceForm.controls['discount'].value ?? 0;
      if (this.inwardInvoiceForm.controls['disPctOrAmt'].value === 'pct')
        this.info.discount = subtotal * (discount / 100);
      else this.info.discount = discount;
    }
  }

  reCalculateSellPrice(form: any) {
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
      this.reCalculateSellPrice(form);
    });
  }

  onDiscountLevelChange() {
    this.lineItems.controls.forEach((control: any) => {
      control.controls['discount'].setValue(0);
    });
    this.inwardInvoiceForm.controls['discount'].setValue(0);
    this.info.discount = 0;
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
    this.calculateFooter();
  }

  submitForm(): void {
    if (this.inwardInvoiceForm.valid) {
      let value = this.inwardInvoiceForm.getRawValue();

      const addDiscountProfitField = (value: any) => {
        if (value.disPctOrAmt === 'pct') {
          value['discountPct'] = value.discount;
          value['discountAmt'] = 0;
          delete value.discount;
          delete value.disPctOrAmt;
        } else {
          value['discountAmt'] = value.discount;
          value['discountPct'] = 0;
          delete value.discount;
          delete value.disPctOrAmt;
        }

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
      addDiscountProfitField(value);
      value.lineItems.forEach((item: any, i: any) => {
        item['lookupFound'] = this.lookupFound[i];
        addDiscountProfitField(item);
      });

      value.totalTaxAmt = this.info.taxAmount;
      value.subtotal = this.info.subtotal;

      console.log(value);
      if (this.isEdit) {
        this._inwardInvoiceService.update(this.id, value).subscribe((res) => {
          console.log('Response:', res);
          this.inwardInvoiceForm.reset();
          this.lineItems.clear();
          this.addLineItem();
        });
      } else
        this._inwardInvoiceService.create(value).subscribe((res) => {
          console.log('Response:', res);
          this.inwardInvoiceForm.reset();
          this.lineItems.clear();
          this.addLineItem();
        });
    } else {
      console.log(this.inwardInvoiceForm.getRawValue());
      this.inwardInvoiceForm.markAllAsTouched();

      Object.keys(this.inwardInvoiceForm.controls).forEach((controlName) => {
        const control = this.inwardInvoiceForm.get(controlName);
        if (control?.invalid) {
          console.log(`Invalid control: ${controlName}`, control);
          console.log(`Errors for control ${controlName}:`, control.errors);
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
        if (control instanceof FormArray) {
          control.controls.forEach((c: any, index: number) => {
            Object.keys(c.controls).forEach((innerControlName) => {
              const innerControl = c.get(innerControlName);
              if (innerControl?.invalid) {
                console.log(
                  `Invalid inner control: ${controlName}[${index}].${innerControlName}`,
                  innerControl
                );
                console.log(
                  `Errors for inner control ${controlName}[${index}].${innerControlName}:`,
                  innerControl.errors
                );
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
      this._productService
        .create(this.productForm.value)
        .subscribe(({ data }) => {
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

  openTagNotFoundModal(form: any) {
    this.tagNotFoundForm.controls['gtn'].setValue(form.value.gtn);
    this.isTagNoNotFoundModalVisible = true;
  }
  addProductToLineItem() {
    if (this.tagNotFoundForm.valid) {
      let form = this.lineItems.controls[this.editingLineItem] as FormGroup;
      form.controls['productId'].setValue(this.tagNotFoundForm.value.productId);
      form.controls['rate'].setValue(this.tagNotFoundForm.value.rate);
      form.controls['qty'].setValue(this.tagNotFoundForm.value.qty);
      this.isTagNoNotFoundModalVisible = false;
    } else {
      Object.keys(this.tagNotFoundForm.controls).forEach((controlName) => {
        const control = this.tagNotFoundForm.get(controlName);
        if (control?.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
