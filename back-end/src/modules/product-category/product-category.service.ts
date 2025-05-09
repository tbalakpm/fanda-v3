import { Not } from 'typeorm';

import { cache } from '../../helpers/cache.helper';

import { AppDataSource } from '../../data-source';
import { AuditUsers } from '../../entities/embedded/audit.entity';
// import { ApiResponse, ApiStatus } from "../../responses";
import { parseError } from '../../helpers/error.helper';
import { ProductCategory } from './product-category.entity';
import { ProductCategorySchema } from './product-category.schema';
import { ApiResponse } from '../../responses/api-response';
import { ApiStatus } from '../../responses/api-status';

export class ProductCategoryService {
  private static categoryRepository = AppDataSource.getRepository(ProductCategory);

  static async getAllCategories(companyId: string): Promise<ApiResponse<ProductCategory[]>> {
    const data = await cache.get<ProductCategory[]>(`product_categories_${companyId}`);
    if (data) {
      return {
        success: true,
        message: 'Serving categories from cache',
        data,
        status: ApiStatus.OK
      };
    }
    const categories = await this.categoryRepository.find({
      select: ['categoryId', 'code', 'name', 'description', 'parentId', 'isActive'],
      where: { companyId },
      order: { companyId: 'ASC', categoryId: 'ASC' }
    });
    await cache.set(`product_categories_${companyId}`, categories);
    return {
      success: true,
      message: 'Serving categories from database',
      data: categories,
      status: ApiStatus.OK
    };
  }

  static async getCategoryById(companyId: string, categoryId: string): Promise<ApiResponse<ProductCategory>> {
    const data = await cache.get<ProductCategory>('product_categories:' + categoryId);
    if (data) {
      return {
        success: true,
        message: 'Serving a category from cache',
        data,
        status: ApiStatus.OK
      };
    }
    const category = await this.categoryRepository.findOne({
      select: ['categoryId', 'code', 'name', 'description', 'parentId', 'isActive'],
      where: { companyId, categoryId }
    });
    if (!category) {
      return {
        success: false,
        message: `Category with id '${categoryId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    await cache.set('product_categories:' + categoryId, category);
    return {
      success: true,
      message: 'Serving category from database',
      data: category,
      status: ApiStatus.OK
    };
  }

  static async createCategory(companyId: string, category: ProductCategory, userId: string): Promise<ApiResponse<ProductCategory>> {
    const parsedResult = ProductCategorySchema.safeParse(category);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parseError(parsedResult),
        status: ApiStatus.BAD_REQUEST
      };
    }

    if (category.code && (await this.isCategoryCodeExists(companyId, category.code))) {
      return {
        success: false,
        message: `Category with code '${category.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (category.name && (await this.isCategoryNameExists(companyId, category.name))) {
      return {
        success: false,
        message: `Category with name '${category.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const parsedCategory = parsedResult.data as ProductCategory;
    parsedCategory.companyId = companyId;
    parsedCategory.user = { created: userId, updated: userId } as AuditUsers;
    const createCategory = this.categoryRepository.create(parsedCategory);
    const newCategory = await this.categoryRepository.save<ProductCategory>(createCategory);
    this.invalidateCache(companyId);
    return {
      success: true,
      message: 'Category created successfully',
      data: newCategory,
      status: ApiStatus.CREATED
    };
  }

  static async updateCategory(
    companyId: string,
    categoryId: string,
    category: Partial<ProductCategory>,
    userId: string
  ): Promise<ApiResponse<ProductCategory>> {
    const dbCategory = await this.categoryRepository.findOneBy({
      companyId,
      categoryId
    });
    if (!dbCategory) {
      return {
        success: false,
        message: `Category with id '${categoryId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    if (category.code && (await this.isCategoryCodeExists(dbCategory.companyId, category.code, categoryId))) {
      return {
        success: false,
        message: `Category with code '${category.code}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }
    if (category.name && (await this.isCategoryNameExists(dbCategory.companyId, category.name, categoryId))) {
      return {
        success: false,
        message: `Category with name '${category.name}' already exists`,
        status: ApiStatus.BAD_REQUEST
      };
    }

    const auditUsers: AuditUsers = { ...dbCategory.user, updated: userId };
    const updateCategory = { ...dbCategory, ...category, user: auditUsers };
    const parsedResult = ProductCategorySchema.safeParse(updateCategory);
    if (!parsedResult.success) {
      return {
        success: false,
        message: parseError(parsedResult),
        status: ApiStatus.BAD_REQUEST
      };
    }
    const parsedCategory = parsedResult.data as ProductCategory;
    const updatedCategory = await this.categoryRepository.save(parsedCategory);
    this.invalidateCache(dbCategory.companyId, categoryId);
    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
      status: ApiStatus.OK
    };
  }

  static async deleteCategory(companyId: string, categoryId: string): Promise<ApiResponse<ProductCategory>> {
    const category = await this.categoryRepository.findOneBy({
      companyId,
      categoryId
    });
    if (!category) {
      return {
        success: false,
        message: `Category with id '${categoryId}' not found`,
        status: ApiStatus.NOT_FOUND
      };
    }
    await this.categoryRepository.remove(category);
    this.invalidateCache(category.companyId, categoryId);
    return {
      success: true,
      message: 'Category deleted successfully',
      data: category,
      status: ApiStatus.OK
    };
  }

  static async isCategoryCodeExists(companyId: string, categoryCode: string, categoryId?: string): Promise<boolean> {
    let exists = true;
    if (categoryId) {
      exists = await this.categoryRepository.exists({
        where: {
          companyId: companyId,
          code: categoryCode,
          categoryId: Not(categoryId)
        }
      });
      return exists;
    }
    exists = await this.categoryRepository.existsBy({
      companyId: companyId,
      code: categoryCode
    });
    return exists;
  }

  static async isCategoryNameExists(companyId: string, categoryName: string, categoryId?: string): Promise<boolean> {
    let exists = true;
    if (categoryId) {
      exists = await this.categoryRepository.exists({
        where: {
          companyId: companyId,
          name: categoryName,
          categoryId: Not(categoryId)
        }
      });
      return exists;
    }
    exists = await this.categoryRepository.existsBy({
      companyId: companyId,
      name: categoryName
    });
    return exists;
  }

  static async invalidateCache(companyId: string, categoryId?: string): Promise<void> {
    await cache.del(`product_categories_${companyId}`);
    if (categoryId) await cache.del('product_categories:' + categoryId);
  }
}
