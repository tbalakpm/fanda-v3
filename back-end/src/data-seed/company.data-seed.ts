import { Customer } from '../modules/customer/customer.entity';
import { FinancialYear } from '../modules/financial-year/financial-year.entity';
import { ProductCategory } from '../modules/product-category/product-category.entity';
import { Supplier } from '../modules/supplier/supplier.entity';
import { Unit } from '../modules/unit/unit.entity';
import { SerialNumber } from '../modules/serial-number/serial-number.entity';
import { DefaultSerials } from './serials.data-seed';

export function getNewYear(companyId: string, adminUserId: string, date: Date = new Date()): FinancialYear {
  const newYear = new FinancialYear();

  // Apr-Dec
  if (date.getMonth() >= 3 && date.getMonth() <= 11) {
    newYear.code = `FY-${date.getFullYear()}-${(date.getFullYear() + 1).toString().substring(2)}`;
    newYear.beginDate = new Date(`${date.getFullYear()}-04-01`);
    newYear.endDate = new Date(`${date.getFullYear() + 1}-03-31`);
  } else {
    newYear.code = `FY-${date.getFullYear() - 1}-${date.getFullYear().toString().substring(2)}`;
    newYear.beginDate = new Date(`${date.getFullYear() - 1}-04-01`);
    newYear.endDate = new Date(`${date.getFullYear()}-03-31`);
  }
  newYear.description = 'Financial year';
  newYear.date = {
    created: new Date(),
    updated: new Date()
  };
  newYear.user = {
    created: adminUserId,
    updated: adminUserId
  };
  newYear.companyId = companyId;
  newYear.isActive = true;
  return newYear;
}

export function getDefaultCashCustomer(companyId: string, adminUserId: string): Customer {
  const cashCustomer = new Customer();
  cashCustomer.code = 'CASH';
  cashCustomer.name = 'Cash';
  cashCustomer.description = 'Cash customer';
  cashCustomer.date = {
    created: new Date(),
    updated: new Date()
  };
  cashCustomer.user = {
    created: adminUserId,
    updated: adminUserId
  };
  cashCustomer.companyId = companyId;
  cashCustomer.isActive = true;
  return cashCustomer;
}

export function getDefaultCashSupplier(companyId: string, adminUserId: string): Supplier {
  const cashSupplier = new Supplier();
  cashSupplier.code = 'CASH';
  cashSupplier.name = 'Cash';
  cashSupplier.description = 'Cash supplier';
  cashSupplier.date = {
    created: new Date(),
    updated: new Date()
  };
  cashSupplier.user = {
    created: adminUserId,
    updated: adminUserId
  };
  cashSupplier.companyId = companyId;
  cashSupplier.isActive = true;

  return cashSupplier;
}

export function getDefaultProductCategory(companyId: string, amdinUserId: string): ProductCategory {
  const defaultCategory = new ProductCategory();
  defaultCategory.code = 'DEFAULT';
  defaultCategory.name = 'Default';
  defaultCategory.description = 'Default product category';
  defaultCategory.companyId = companyId;
  defaultCategory.isActive = true;
  defaultCategory.date = {
    created: new Date(),
    updated: new Date()
  };
  defaultCategory.user = {
    created: amdinUserId,
    updated: amdinUserId
  };
  return defaultCategory;
}

export function getDefaultUnit(companyId: string, adminUserId: string): Unit {
  const numberUnit = new Unit();
  numberUnit.code = 'NO';
  numberUnit.name = 'Number';
  numberUnit.description = 'Default unit';
  numberUnit.companyId = companyId;
  numberUnit.isActive = true;
  numberUnit.date = {
    created: new Date(),
    updated: new Date()
  };
  numberUnit.user = {
    created: adminUserId,
    updated: adminUserId
  };
  return numberUnit;
}

export function getDefaultSequences(yearId: string): SerialNumber[] {
  const serials = DefaultSerials.map((serial) => {
    const newSerial = new SerialNumber();
    newSerial.key = serial.key;
    newSerial.prefix = serial.prefix;
    newSerial.current = serial.current;
    newSerial.length = serial.length;
    newSerial.yearId = yearId;

    return newSerial;
  });
  return serials;
}
