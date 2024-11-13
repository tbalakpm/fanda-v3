import { v7 } from "uuid";
import { AppDataSource } from "../data-source";
import { Customer } from "../modules/customer/customer.entity";
import { CustomerService } from "../modules/customer/customer.service";
import { FinancialYear } from "../modules/financial-year/financial-year.entity";
import { FinancialYearService } from "../modules/financial-year/financial-year.service";
import { ProductCategory } from "../modules/product-category/product-category.entity";
import { ProductCategoryService } from "../modules/product-category/product-category.service";
import { Supplier } from "../modules/supplier/supplier.entity";
import { SupplierService } from "../modules/supplier/supplier.service";
import { Unit } from "../modules/unit/unit.entity";
import { UnitService } from "../modules/unit/unit.service";
import { SequenceGenerator } from "../modules/sequence-generator/sequence-generator.entity";

export class CompanyDataSeeder {
  static async createYear(companyId: string, adminUserId: string, date: Date = new Date()): Promise<void> {
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
    newYear.companyId = companyId;
    newYear.isActive = true;

    const savedYear = await FinancialYearService.createYear(companyId, newYear, adminUserId);
    if (!savedYear.success) return;

    await this.createSequences(savedYear.data!.yearId, adminUserId);
  }

  static async createCashCustomer(companyId: string, adminUserId: string): Promise<void> {
    const cashCustomer = {
      code: "CASH",
      name: "Cash",
      description: "Cash customer"
    } as Customer;
    await CustomerService.createCustomer(companyId, cashCustomer, adminUserId);
  }

  static async createCashSupplier(companyId: string, adminUserId: string): Promise<void> {
    const cashSupplier = {
      code: "CASH",
      name: "Cash",
      description: "Cash supplier"
    } as Supplier;
    await SupplierService.createSupplier(companyId, cashSupplier, adminUserId);
  }

  static async createDefaultProductCategory(companyId: string, amdinUserId: string): Promise<void> {
    const defaultCategory = {
      code: "DEFAULT",
      name: "Default",
      description: "Default product category"
    } as ProductCategory;
    await ProductCategoryService.createCategory(companyId, defaultCategory, amdinUserId);
  }

  static async createDefaultUnit(companyId: string, adminUserId: string): Promise<void> {
    const numberUnit = {
      code: "NO",
      name: "Number",
      description: "Default unit"
    } as Unit;
    await UnitService.createUnit(companyId, numberUnit, adminUserId);
  }

  static async createSequences(yearId: string, adminUserId: string): Promise<void> {
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

    //  await this.sequenceRepository.insert(sequences);
    await AppDataSource.getRepository("SequenceGenerator").insert(sequences);
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
