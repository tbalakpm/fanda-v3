import { Not, type QueryRunner } from 'typeorm';

import { cache } from '../../helpers/cache.helper';

import { AppDataSource } from '../../data-source';
import type { AuditUsers } from '../../entities/embedded/audit.entity';
import { parseError } from '../../helpers/error.helper';
import { Product } from './product.entity';
import { ProductSchema } from './product.schema';
import type { ApiResponse } from '../../responses/api-response';
import { ApiStatus } from '../../responses/api-status';
import { GtnGeneration } from './gtn-generation.enum';

const productRepository = AppDataSource.getRepository(Product);

export async function getAllProducts(companyId: string): Promise<ApiResponse<Product[]>> {
  const data = await cache.get<Product[]>(`products_${companyId}`);
  if (data) {
    return {
      success: true,
      message: 'Serving products from cache',
      data,
      status: ApiStatus.OK
    };
  }
  const products = await productRepository.find({
    select: [
      'productId',
      'code',
      'name',
      'description',
      'categoryId',
      'baseUnitId',
      'buyingPrice',
      'marginPct',
      'marginAmt',
      'sellingPrice',
      'taxCode',
      'taxPct',
      'taxPreference',
      'isPriceInclusiveTax',
      'gtnGeneration',
      'isActive'
    ],
    where: { companyId },
    order: { companyId: 'ASC', productId: 'ASC' }
  });
  await cache.set(`products_${companyId}`, products);
  return {
    success: true,
    message: 'Serving products from database',
    data: products,
    status: ApiStatus.OK
  };
}

export async function getProductById(companyId: string, productId: string, queryRunner?: QueryRunner): Promise<ApiResponse<Product>> {
  const data = await cache.get<Product>(`products:${productId}`);
  if (data) {
    return {
      success: true,
      message: 'Serving a product from cache',
      data,
      status: ApiStatus.OK
    };
  }
  const product = await (queryRunner ? queryRunner.manager.getRepository(Product) : productRepository).findOne({
    select: [
      'productId',
      'code',
      'name',
      'description',
      'categoryId',
      'baseUnitId',
      'buyingPrice',
      'marginPct',
      'marginAmt',
      'sellingPrice',
      'taxCode',
      'taxPct',
      'taxPreference',
      'isPriceInclusiveTax',
      'gtnGeneration',
      'isActive'
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
  await cache.set(`products:${productId}`, product);
  return {
    success: true,
    message: 'Serving product from database',
    data: product,
    status: ApiStatus.OK
  };
}

export async function createProduct(companyId: string, product: Product, userId: string): Promise<ApiResponse<Product>> {
  if (!product.categoryId) {
    const defaultCategory = await AppDataSource.getRepository('ProductCategory').findOne({ where: { companyId, code: 'DEFAULT' } });
    if (defaultCategory) {
      product.categoryId = defaultCategory.categoryId;
    }
  }
  if (!product.baseUnitId) {
    const defaultUnit = await AppDataSource.getRepository('Unit').findOne({ where: { companyId, code: 'NO' } });
    if (defaultUnit) {
      product.baseUnitId = defaultUnit.unitId;
    }
  }
  if (!product.gtnGeneration) product.gtnGeneration = GtnGeneration.Tag;

  const parsedResult = ProductSchema.safeParse(product);
  if (!parsedResult.success) {
    return {
      success: false,
      message: parseError(parsedResult),
      status: ApiStatus.BAD_REQUEST
    };
  }

  if (product.code && (await isProductCodeExists(companyId, product.code))) {
    return {
      success: false,
      message: `Product with code '${product.code}' already exists`,
      status: ApiStatus.BAD_REQUEST
    };
  }
  if (product.name && (await isProductNameExists(companyId, product.name))) {
    return {
      success: false,
      message: `Product with name '${product.name}' already exists`,
      status: ApiStatus.BAD_REQUEST
    };
  }

  const parsedProduct = parsedResult.data as Product;
  parsedProduct.companyId = companyId;
  parsedProduct.user = { created: userId, updated: userId } as AuditUsers;
  const createProduct = productRepository.create(parsedProduct);
  const newProduct = await productRepository.save<Product>(createProduct);
  invalidateCache(companyId);
  return {
    success: true,
    message: 'Product created successfully',
    data: newProduct,
    status: ApiStatus.CREATED
  };
}

export async function updateProduct(companyId: string, productId: string, product: Partial<Product>, userId: string): Promise<ApiResponse<Product>> {
  const dbProduct = await productRepository.findOneBy({
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
  if (product.code && (await isProductCodeExists(dbProduct.companyId, product.code, productId))) {
    return {
      success: false,
      message: `Product with code '${product.code}' already exists`,
      status: ApiStatus.BAD_REQUEST
    };
  }
  if (product.name && (await isProductNameExists(dbProduct.companyId, product.name, productId))) {
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
  const updatedProduct = await productRepository.save(parsedProduct);
  invalidateCache(dbProduct.companyId, productId);
  return {
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct,
    status: ApiStatus.OK
  };
}

export async function deleteProduct(companyId: string, productId: string): Promise<ApiResponse<Product>> {
  const product = await productRepository.findOneBy({
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
  await productRepository.remove(product);
  invalidateCache(product.companyId, productId);
  return {
    success: true,
    message: 'Product deleted successfully',
    data: product,
    status: ApiStatus.OK
  };
}

export async function isProductCodeExists(companyId: string, productCode: string, productId?: string): Promise<boolean> {
  let exists = true;
  if (productId) {
    exists = await productRepository.exists({
      where: {
        companyId: companyId,
        code: productCode,
        productId: Not(productId)
      }
    });
    return exists;
  }
  exists = await productRepository.existsBy({
    companyId: companyId,
    code: productCode
  });
  return exists;
}

export async function isProductNameExists(companyId: string, productName: string, productId?: string): Promise<boolean> {
  let exists = true;
  if (productId) {
    exists = await productRepository.exists({
      where: {
        companyId: companyId,
        name: productName,
        productId: Not(productId)
      }
    });
    return exists;
  }
  exists = await productRepository.existsBy({
    companyId: companyId,
    name: productName
  });
  return exists;
}
async function invalidateCache(companyId: string, productId?: string): Promise<void> {
  await cache.del(`products_${companyId}`);
  if (productId) {
    await cache.del(`products:${productId}`);
  }
}
