import { v7 } from "uuid";

import { Customer } from "../modules/customer/customer.entity";
import { FinancialYear } from "../modules/financial-year/financial-year.entity";
import { ProductCategory } from "../modules/product-category/product-category.entity";
import { Supplier } from "../modules/supplier/supplier.entity";
import { Unit } from "../modules/unit/unit.entity";
import { SequenceGenerator } from "../modules/sequence-generator/sequence-generator.entity";

export class CompanyDataSeeder {
  static getNewYear(companyId: string, adminUserId: string, date: Date = new Date()): FinancialYear {
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
    newYear.description = "Financial year";
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
    // const savedYear = await FinancialYearService.createYear(companyId, newYear, adminUserId);
    // if (!savedYear.success) return;
    // await this.createSequences(savedYear.data!.yearId, adminUserId);
  }

  static getDefaultCashCustomer(companyId: string, adminUserId: string): Customer {
    const cashCustomer = new Customer();
    cashCustomer.code = "CASH";
    cashCustomer.name = "Cash";
    cashCustomer.description = "Cash customer";
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

    // await CustomerService.createCustomer(companyId, cashCustomer, adminUserId);
  }

  static getDefaultCashSupplier(companyId: string, adminUserId: string): Supplier {
    const cashSupplier = new Supplier();
    cashSupplier.code = "CASH";
    cashSupplier.name = "Cash";
    cashSupplier.description = "Cash supplier";
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
    // await SupplierService.createSupplier(companyId, cashSupplier, adminUserId);
  }

  static getDefaultProductCategory(companyId: string, amdinUserId: string): ProductCategory {
    const defaultCategory = new ProductCategory();
    defaultCategory.code = "DEFAULT";
    defaultCategory.name = "Default";
    defaultCategory.description = "Default product category";
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

    // await ProductCategoryService.createCategory(companyId, defaultCategory, amdinUserId);
  }

  static getDefaultUnit(companyId: string, adminUserId: string): Unit {
    const numberUnit = new Unit();
    numberUnit.code = "NO";
    numberUnit.name = "Number";
    numberUnit.description = "Default unit";
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

    // await UnitService.createUnit(companyId, numberUnit, adminUserId);
  }

  static getDefaultSequences(yearId: string, adminUserId: string): SequenceGenerator[] {
    const sequences = this.defaultSequences.map((sequence) => {
      const newSequence = new SequenceGenerator();
      newSequence.sequenceId = v7();
      newSequence.key = sequence.key;
      newSequence.prefix = sequence.prefix;
      newSequence.current = sequence.current;
      newSequence.length = sequence.length;
      newSequence.yearId = yearId;
      newSequence.isActive = true;
      newSequence.date = {
        created: new Date(),
        updated: new Date()
      };
      newSequence.user = {
        created: adminUserId,
        updated: adminUserId
      };

      return newSequence;
    });
    return sequences;
    // await AppDataSource.getRepository("SequenceGenerator").insert(sequences);
  }

  static defaultSequences = [
    {
      key: "purchase",
      prefix: "I",
      current: 1,
      length: 7
    },
    {
      key: "sales",
      prefix: "B",
      current: 1,
      length: 7
    },
    {
      key: "salesreturn",
      prefix: "R",
      current: 1,
      length: 7
    },
    {
      key: "purchasereturn",
      prefix: "U",
      current: 1,
      length: 7
    },
    {
      key: "stock",
      prefix: "K",
      current: 1,
      length: 7
    },
    {
      key: "transfer",
      prefix: "T",
      current: 1,
      length: 7
    },
    {
      key: "gtn",
      prefix: "A",
      current: 1,
      length: 7
    }
  ];
}
