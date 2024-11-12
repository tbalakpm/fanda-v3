import { Not } from "typeorm";

import { cache } from "../../helpers/cache.helper";

import { AppDataSource } from "../../data-source";
import { AuditUsers } from "../../entities/embedded/audit.entity";
// import { ApiResponse, ApiStatus } from "../../responses";
import { parseError } from "../../helpers/error.helper";
import { Customer } from "./customer.entity";
import { CustomerSchema } from "./customer.schema";
import { ApiResponse } from "../../responses/api-response";
import { ApiStatus } from "../../responses/api-status";

export class CustomerService {
  private static customerRepository = AppDataSource.getRepository(Customer);

  static async getAllCustomers(companyId: string): Promise<ApiResponse<Customer[]>> {
    const data = await cache.get<Customer[]>(`customers_${companyId}`);
    if (data) {
      return {
        success: true,
        message: "Serving customers from cache",
        data,
        status: ApiStatus.OK
      };
    }
    const customers = await this.customerRepository.find({
      select: ["customerId", "code", "name", "description", "address", "contact", "isActive"],
      where: { companyId },
      order: { companyId: "ASC", customerId: "ASC" }
    });
    await cache.set(`customers_${companyId}`, customers);
    return {
      success: true,
      message: "Serving customers from database",
      data: customers,
      status: ApiStatus.OK
    };
  }

  static async getCustomerById(companyId: string, customerId: string): Promise<ApiResponse<Customer>> {
    const data = await cache.get<Customer>("customers:" + customerId);
    if (data) {
      return {
        success: true,
        message: "Serving a customer from cache",
        data,
        status: ApiStatus.OK
      };
    }
    const customer = await this.customerRepository.findOne({
      select: ["customerId", "code", "name", "description", "address", "contact", "isActive"],
      where: { companyId, customerId }
    });
    if (!customer) {
      return {
        success: false,
        message: `Customer with id '${customerId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    await cache.set("customers:" + customerId, customer);
    return {
      success: true,
      message: "Serving customer from database",
      data: customer,
      status: ApiStatus.OK
    };
  }

  static async createCustomer(companyId: string, customer: Customer, userId: string): Promise<ApiResponse<Customer>> {
    const parsedResult = CustomerSchema.safeParse(customer);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parseError(parsedResult),
        status: ApiStatus.BAD_REQUEST
      };
    }

    if (customer.code && (await this.isCustomerCodeExists(companyId, customer.code))) {
      return {
        success: false,
        message: `Customer with code '${customer.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (customer.name && (await this.isCustomerNameExists(companyId, customer.name))) {
      return {
        success: false,
        message: `Customer with name '${customer.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const parsedCustomer = parsedResult.data as Customer;
    parsedCustomer.companyId = companyId;
    parsedCustomer.user = { created: userId, updated: userId } as AuditUsers;
    const createCustomer = this.customerRepository.create(parsedCustomer);
    const newCustomer = await this.customerRepository.save<Customer>(createCustomer);
    this.invalidateCache(companyId);
    return {
      success: true,
      message: "Customer created successfully",
      data: newCustomer,
      status: ApiStatus.CREATED
    };
  }

  static async updateCustomer(companyId: string, customerId: string, customer: Partial<Customer>, userId: string): Promise<ApiResponse<Customer>> {
    const dbCustomer = await this.customerRepository.findOneBy({
      companyId,
      customerId
    });
    if (!dbCustomer) {
      return {
        success: false,
        message: `Customer with id '${customerId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    if (customer.code && (await this.isCustomerCodeExists(dbCustomer.companyId, customer.code, customerId))) {
      return {
        success: false,
        message: `Customer with code '${customer.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (customer.name && (await this.isCustomerNameExists(dbCustomer.companyId, customer.name, customerId))) {
      return {
        success: false,
        message: `Customer with name '${customer.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const auditUsers: AuditUsers = { ...dbCustomer.user, updated: userId };
    const updateCustomer = { ...dbCustomer, ...customer, user: auditUsers };
    const parsedResult = CustomerSchema.safeParse(updateCustomer);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parseError(parsedResult),
        status: ApiStatus.BAD_REQUEST
      };
    }
    const parsedCustomer = parsedResult.data as Customer;
    const updatedCustomer = await this.customerRepository.save(parsedCustomer);
    this.invalidateCache(dbCustomer.companyId, customerId);
    return {
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
      status: ApiStatus.OK
    };
  }

  static async deleteCustomer(companyId: string, customerId: string): Promise<ApiResponse<Customer>> {
    const customer = await this.customerRepository.findOneBy({
      companyId,
      customerId
    });
    if (!customer) {
      return {
        success: false,
        message: `Customer with id '${customerId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    await this.customerRepository.remove(customer);
    this.invalidateCache(customer.companyId, customerId);
    return {
      success: true,
      message: "Customer deleted successfully",
      data: customer,
      status: ApiStatus.OK
    };
  }

  static async isCustomerCodeExists(companyId: string, customerCode: string, customerId?: string): Promise<boolean> {
    let exists = true;
    if (customerId) {
      exists = await this.customerRepository.exists({
        where: {
          companyId: companyId,
          code: customerCode,
          customerId: Not(customerId)
        }
      });
      return exists;
    }
    exists = await this.customerRepository.existsBy({
      companyId: companyId,
      code: customerCode
    });
    return exists;
  }

  static async isCustomerNameExists(companyId: string, customerName: string, customerId?: string): Promise<boolean> {
    let exists = true;
    if (customerId) {
      exists = await this.customerRepository.exists({
        where: {
          companyId: companyId,
          name: customerName,
          customerId: Not(customerId)
        }
      });
      return exists;
    }
    exists = await this.customerRepository.existsBy({
      companyId: companyId,
      name: customerName
    });
    return exists;
  }

  static async invalidateCache(companyId: string, customerId?: string): Promise<void> {
    await cache.del(`customers_${companyId}`);
    if (customerId) await cache.del("customers:" + customerId);
  }
}
