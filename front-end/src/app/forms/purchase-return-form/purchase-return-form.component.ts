import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { forkJoin } from 'rxjs';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';

import { PageHeaderComponent } from '@components';
import {
  GST_TREATMENTS_OUT,
  INVOICE_TYPES,
  INVOICE_TYPES_DICT,
} from '@constants';
import { LineItem, Party, Product } from '@models';
import {
  CustomerService,
  InventoryService,
  OutwardInvoiceService,
} from '@services';
import { watchObject } from '@utils';

@Component({
  selector: 'purchase-return-form',
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
    NzDividerModule,
  ],
  templateUrl: './purchase-return-form.component.html',
  styleUrl: './purchase-return-form.component.css',
})
export class PurchaseReturnFormComponent {
  outwardInvoiceForm: FormGroup;
  customerForm: FormGroup;

  customers: Party[] = [];
  products: any[] = [];

  invoiceTypesDict = INVOICE_TYPES_DICT;
  invoiceTypes = INVOICE_TYPES;
  gstTreatments = GST_TREATMENTS_OUT;

  formatter = (value: number) =>
    value ? value.toIndianCurrencyFormat() : '₹0.00';
  numberFormatter = (value: number) =>
    value ? value.toIndianNumberFormat() : '₹0.00';

  // only display 2 decimal points
  removeDecimal = (value: number) => `${Math.floor(value * 100) / 100}`;

  config = {
    discountLevel: 'transaction',
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

  isCashCustomer = false;
  isCashCustomerModal = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _outwardInvoiceService: OutwardInvoiceService,
    private _customerService: CustomerService,
    private _inventoryService: InventoryService,
    private _messageService: NzMessageService
  ) {
    let config = JSON.parse(localStorage.getItem('config') || '{}');
    if (config) this.config = config;

    this.config = watchObject(this.config, (prop, value) => {
      localStorage.setItem('config', JSON.stringify(this.config));
    });
  }

  ngOnInit(): void {
    this.outwardInvoiceForm = this.fb.group({
      invoiceNumber: [''],
      invoiceDate: [Date.now(), [Validators.required]],
      refNum: [''],
      refDate: [null],
      customer: [null, [Validators.required]],
      // invoiceType: [this.invoiceType, [Validators.required]],
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

    this.customerForm = this.fb.group({
      salutation: '',
      firstName: ['', [Validators.maxLength(50)]],
      lastName: '',
      mobile: ['', [Validators.maxLength(25)]],
      email: ['', [Validators.email]],
      addressLine1: ['', [Validators.maxLength(50)]],
      addressLine2: ['', [Validators.maxLength(50)]],
      area: ['', [Validators.maxLength(25)]],
      city: ['', [Validators.maxLength(25)]],
      state: ['', [Validators.maxLength(25)]],
      country: ['', [Validators.maxLength(25)]],
      postalCode: ['', [Validators.maxLength(10)]],
    });

    this.addLineItem();

    ['disPctOrAmt', 'discount'].forEach((controlName) => {
      this.outwardInvoiceForm.controls[controlName].valueChanges.subscribe(
        () => {
          if (this.config.discountLevel === 'transaction') {
            this.calculateFooter();
          }
        }
      );
    });

    // this.outwardInvoiceForm.controls['customer'].valueChanges.subscribe(
    //   (value: string) => {
    //     if (
    //       this.customers.find((c) => c.id === value)?.name.toLowerCase() ===
    //       'cash'
    //     ) {
    //       this.isCashCustomer = true;
    //       this.isCashCustomerModal = true;
    //     } else {
    //       this.isCashCustomer = false;
    //       this.isCashCustomerModal = false;
    //     }
    //   }
    // );

    this.id = this.route.snapshot.params['id'];

    let requests: any[] = [
      this._customerService.getAll({ filter: 'isActive:eq:true' }),
      // this._productService.getAll({ value: false, field: 'isActive' }),
    ];

    if (this.id && this.id !== 'new') {
      requests.push(this._outwardInvoiceService.getById(this.id));
      this.isEdit = true;
      this.outwardInvoiceForm.disable();
    }

    forkJoin(requests).subscribe((res: any) => {
      this.customers = res[0].data;
      if (this.id === 'new') return;
      this.outwardInvoiceForm.patchValue(res[2]);
    });
  }

  getUnit(productId: string) {
    const product = this.products.find((p) => p._id === productId);
    return product?.unit?.code ?? '';
  }

  getQtyOnHand(productId: string) {
    const product = this.products.find((p) => p._id === productId);
    return product?.qtyOnHand ?? 1;
  }

  getProductName(productId: string) {
    const product = this.products.find((p) => p._id === productId);
    return product?.name ?? '';
  }

  getProductHSN(productId: string) {
    const product = this.products.find((p) => p._id === productId);
    return product?.taxCode ? '- ' + product.taxCode : '';
  }

  getGtnDetails(gtn: string, form: any) {
    if (!gtn) return;
    if (this.products.find((p) => p.gtn === gtn)) {
      form.controls['gtn'].setValue('');
      this._messageService.error('Product already added');
      return;
    }
    this._inventoryService.searchGtn(gtn).subscribe(
      (res) => {
        console.log(res);
        if (res.qtyOnHand <= 0) {
          form.controls['gtn'].setValue('');
          this._messageService.error('Product is out of stock');
          return;
        }
        if (!this.products.find((p) => p.gtn === res.gtn)) {
          // console.log("Product doesn't exist");
          this.products.push({
            _id: res.product.productId,
            code: res.product.code,
            gtn: res.gtn,
            name: res.product.name,
            taxPct: res.product.taxPct ?? 0,
            taxCode: res.product.taxCode ?? '',
            qtyOnHand: res.qtyOnHand,
            buyingPrice: res.buyingPrice,
            sellingPrice: res.sellingPrice,
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
      (_) => {
        form.controls['gtn'].setValue('');
      }
    );
  }

  getProductPrice(gtn: string) {
    const product: Product = this.products.find((p) => p.gtn === gtn);
    if (product.sellingPrice && product.sellingPrice > 0) {
      return product.sellingPrice;
    }

    if (product.marginPct && product.buyingPrice && product.marginPct > 0)
      return (
        product.buyingPrice + (product.buyingPrice * product.marginPct) / 100
      );

    if (product.marginAmt && product.buyingPrice && product.marginAmt > 0)
      return product.buyingPrice + product.marginAmt;

    return 0;
  }

  get lineItems(): FormArray {
    return this.outwardInvoiceForm.get('lineItems') as FormArray;
  }

  addLineItem(): void {
    let form: any = this.fb.group({
      // inventoryId: [null, Validators.required],
      productId: [null, Validators.required],
      unitId: ['', Validators.required],
      gtn: ['', Validators.required],
      // description: [''],
      qty: [1, Validators.required],
      rate: [0, Validators.required],
      price: [0, Validators.required],
      disPctOrAmt: ['pct', Validators.required],
      discount: [0, Validators.required],
      taxPct: [0, Validators.required],
      taxAmt: [0, Validators.required],
      discountPct: [null],
      discountAmt: [null],
      // taxCode: [''],
      // interTaxPct: [null],
      // intraTaxPct: [null],
      // centralTaxPct: [null],
      lineTotal: [0, Validators.required],
    });

    const setDiscount = () => {
      const qty = form.controls.qty.value ?? 0;
      const rate = form.controls.rate.value ?? 0;
      const discount = form.controls.discount.value ?? 0;
      const product = this.products.find(
        (p) => p._id === form.controls.productId.value
      )!;
      form.controls.price.setValue(qty * rate);
      const price = form.controls.price.value;

      let lineTotal = 0;
      if (this.config.discountLevel === 'item')
        if (form.controls.disPctOrAmt.value === 'pct') {
          const discountAmount = price * (discount / 100);
          lineTotal = price - discountAmount;
          form.controls.discountAmt.setValue(discountAmount);
          form.controls.discountPct.setValue(discount);
        } else {
          lineTotal = price - discount;
          form.controls.discountAmt.setValue(discount);
        }
      else lineTotal = qty * rate;

      if (product?.taxPct) {
        const taxAmt = (lineTotal * product.taxPct) / 100;
        lineTotal += taxAmt;
        form.controls.taxAmt.setValue(taxAmt);
        form.controls.taxPct.setValue(product.taxPct);
      }

      form.controls.lineTotal.setValue(lineTotal);
    };

    form.controls.productId.valueChanges.subscribe((productId: string) => {
      console.log('productId', productId);
      if (!productId) return;
      let productGtn = form.value.gtn;
      const product = this.products.find((p) => p.gtn === productGtn)!;
      form.controls.unitId.setValue(product.unit!._id!);
      form.controls.rate.setValue(this.getProductPrice(productGtn));
    });

    ['qty', 'rate', 'disPctOrAmt', 'discount'].forEach((controlName) => {
      form.controls[controlName].valueChanges.subscribe(() => {
        setDiscount();
        this.calculateFooter();
      });
    });

    this.lineItems.push(form);
    this.calculateFooter();
  }

  calculateFooter() {
    this.info.subtotal = 0;
    this.info.totalQty = 0;
    this.info.taxAmount = 0;
    this.info.discount = 0;
    this.info.totalPrice = 0;
    this.outwardInvoiceForm.value.lineItems.forEach((item: LineItem) => {
      this.info.subtotal += item.lineTotal;
      this.info.totalQty += item.qty;
      // this.info.taxAmount += item.lineTotal - item.price;
      this.info.taxAmount += item.taxAmt ? item.taxAmt : 0;
      this.info.totalPrice += item.price;
      if (this.config.discountLevel === 'item')
        this.info.discount += item.discountAmt ? item.discountAmt : 0;
    });

    this.outwardInvoiceForm.controls['subtotal'].setValue(this.info.subtotal);
    this.outwardInvoiceForm.controls['totalQty'].setValue(this.info.totalQty);

    if (this.config.discountLevel === 'transaction') {
      const subtotal = this.outwardInvoiceForm.controls['subtotal'].value ?? 0;
      const discount = this.outwardInvoiceForm.controls['discount'].value ?? 0;
      if (this.outwardInvoiceForm.controls['disPctOrAmt'].value === 'pct')
        this.info.discount = subtotal * (discount / 100);
      else this.info.discount = discount;
    }
  }

  onDiscountLevelChange() {
    this.lineItems.controls.forEach((control: any) => {
      control.controls['discount'].setValue(0);
    });
    this.outwardInvoiceForm.controls['discount'].setValue(0);
    this.info.discount = 0;
  }

  getProductTax(id: string) {
    const product = this.products.find((p) => p._id === id);
    return product?.taxPct ?? 0;
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
    this.calculateFooter();
  }

  submitForm(): void {
    let value = this.outwardInvoiceForm.getRawValue();

    // Invoice level discount
    if (value.disPctOrAmt === 'pct') {
      value['discountPct'] = value.discount;
    } else {
      value['discountPct'] = 0;
    }
    value['discountAmt'] =
      this.config.discountLevel === 'transaction' ? this.info.discount : 0;
    delete value.discount;
    delete value.disPctOrAmt;

    value.totalTaxAmt = this.info.taxAmount;

    value.lineItems.map((item: any) => {
      delete item.disPctOrAmt;
      delete item.discount;
      return item;
    });
    if (this.isCashCustomer)
      value['customer'] = this.customerForm.getRawValue();
    // console.log(value);
    if (this.outwardInvoiceForm.valid) {
      if (this.isEdit) {
        this._outwardInvoiceService.update(this.id, value).subscribe((res) => {
          this.outwardInvoiceForm.reset();
          this.lineItems.clear();
          this.addLineItem();
        });
      } else
        this._outwardInvoiceService.create(value).subscribe((res) => {
          this.outwardInvoiceForm.reset();
          this.lineItems.clear();
          this.addLineItem();
        });
    } else {
      this.outwardInvoiceForm.markAllAsTouched();

      Object.values(this.outwardInvoiceForm.controls).forEach(
        (control: any) => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
          if (control instanceof FormArray) {
            control.controls.forEach((c: any) => {
              Object.values(c.controls).forEach((innerControl: any) => {
                // console.log(innerControl.errors, innerControl);
                if (innerControl.invalid) {
                  innerControl.markAsDirty();
                  innerControl.updateValueAndValidity({ onlySelf: true });
                }
              });
            });
          }
        }
      );
    }
  }
}
