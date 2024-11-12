import { Not } from "typeorm";

import { cache } from "../../helpers/cache.helper";

import { AppDataSource } from "../../data-source";
import { AuditUsers } from "../../entities/embedded/audit.entity";
// import { ApiResponse, ApiStatus } from "../../responses";
import { parseError } from "../../helpers/error.helper";
import { Product } from "./product.entity";
import { ProductSchema } from "./product.schema";
import { ApiResponse } from "../../responses/api-response";
import { ApiStatus } from "../../responses/api-status";

export class ProductService {
  private static productRepository = AppDataSource.getRepository(Product);

  static async getAllProducts(companyId: string): Promise<ApiResponse<Product[]>> {
    const data = await cache.get<Product[]>(`products_${companyId}`);
    if (data) {
      return {
        success: true,
        message: "Serving products from cache",
        data,
        status: ApiStatus.OK
      };
    }
    const products = await this.productRepository.find({
      select: [
        "productId",
        "code",
        "name",
        "description",
        "categoryId",
        "baseUnitId",
        "buyingPrice",
        "marginPct",
        "marginAmt",
        "sellingPrice",
        "taxCode",
        "taxPct",
        "taxPreference",
        "isPriceInclusiveTax",
        "isActive"
      ],
      where: { companyId },
      order: { companyId: "ASC", productId: "ASC" }
    });
    await cache.set(`products_${companyId}`, products);
    return {
      success: true,
      message: "Serving products from database",
      data: products,
      status: ApiStatus.OK
    };
  }

  static async getProductById(companyId: string, productId: string): Promise<ApiResponse<Product>> {
    const data = await cache.get<Product>("products:" + productId);
    if (data) {
      return {
        success: true,
        message: "Serving a product from cache",
        data,
        status: ApiStatus.OK
      };
    }
    const product = await this.productRepository.findOne({
      select: [
        "productId",
        "code",
        "name",
        "description",
        "categoryId",
        "baseUnitId",
        "buyingPrice",
        "marginPct",
        "marginAmt",
        "sellingPrice",
        "taxCode",
        "taxPct",
        "taxPreference",
        "isPriceInclusiveTax",
        "isActive"
      ],
      where: { companyId, productId }
    });
    if (!product) {
      return {
        success: false,
        message: `Product with id '${productId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    await cache.set("products:" + productId, product);
    return {
      success: true,
      message: "Serving product from database",
      data: product,
      status: ApiStatus.OK
    };
  }

  static async createProduct(companyId: string, product: Product, userId: string): Promise<ApiResponse<Product>> {
    const parsedResult = ProductSchema.safeParse(product);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parseError(parsedResult),
        status: ApiStatus.BAD_REQUEST
      };
    }

    if (product.code && (await this.isProductCodeExists(companyId, product.code))) {
      return {
        success: false,
        message: `Product with code '${product.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (product.name && (await this.isProductNameExists(companyId, product.name))) {
      return {
        success: false,
        message: `Product with name '${product.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const parsedProduct = parsedResult.data as Product;
    parsedProduct.companyId = companyId;
    parsedProduct.user = { created: userId, updated: userId } as AuditUsers;
    const createProduct = this.productRepository.create(parsedProduct);
    const newProduct = await this.productRepository.save<Product>(createProduct);
    this.invalidateCache(companyId);
    return {
      success: true,
      message: "Product created successfully",
      data: newProduct,
      status: ApiStatus.CREATED
    };
  }

  static async updateProduct(companyId: string, productId: string, product: Partial<Product>, userId: string): Promise<ApiResponse<Product>> {
    const dbProduct = await this.productRepository.findOneBy({
      companyId,
      productId
    });
    if (!dbProduct) {
      return {
        success: false,
        message: `Product with id '${productId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    if (product.code && (await this.isProductCodeExists(dbProduct.companyId, product.code, productId))) {
      return {
        success: false,
        message: `Product with code '${product.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (product.name && (await this.isProductNameExists(dbProduct.companyId, product.name, productId))) {
      return {
        success: false,
        message: `Product with name '${product.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const auditUsers: AuditUsers = { ...dbProduct.user, updated: userId };
    const updateProduct = { ...dbProduct, ...product, user: auditUsers };
    const parsedResult = ProductSchema.safeParse(updateProduct);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parseError(parsedResult),
        status: ApiStatus.BAD_REQUEST
      };
    }
    const parsedProduct = parsedResult.data as Product;
    const updatedProduct = await this.productRepository.save(parsedProduct);
    this.invalidateCache(dbProduct.companyId, productId);
    return {
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
      status: ApiStatus.OK
    };
  }

  static async deleteProduct(companyId: string, productId: string): Promise<ApiResponse<Product>> {
    const product = await this.productRepository.findOneBy({
      companyId,
      productId
    });
    if (!product) {
      return {
        success: false,
        message: `Product with id '${productId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    await this.productRepository.remove(product);
    this.invalidateCache(product.companyId, productId);
    return {
      success: true,
      message: "Product deleted successfully",
      data: product,
      status: ApiStatus.OK
    };
  }

  static async isProductCodeExists(companyId: string, productCode: string, productId?: string): Promise<boolean> {
    let exists = true;
    if (productId) {
      exists = await this.productRepository.exists({
        where: {
          companyId: companyId,
          code: productCode,
          productId: Not(productId)
        }
      });
      return exists;
    }
    exists = await this.productRepository.existsBy({
      companyId: companyId,
      code: productCode
    });
    return exists;
  }

  static async isProductNameExists(companyId: string, productName: string, productId?: string): Promise<boolean> {
    let exists = true;
    if (productId) {
      exists = await this.productRepository.exists({
        where: {
          companyId: companyId,
          name: productName,
          productId: Not(productId)
        }
      });
      return exists;
    }
    exists = await this.productRepository.existsBy({
      companyId: companyId,
      name: productName
    });
    return exists;
  }

  static async invalidateCache(companyId: string, productId?: string): Promise<void> {
    await cache.del(`products_${companyId}`);
    if (productId) await cache.del("products:" + productId);
  }
}
